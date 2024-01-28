import {Pinecone, PineconeRecord} from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import {PDFLoader} from "langchain/document_loaders/fs/pdf"
import {Document, RecursiveCharacterTextSplitter} from "@pinecone-database/doc-splitter"
import {getEmbeddings} from "./embeddings";
import md5 from "md5";
import { convertToAscii  } from "./utils";

const pinecone = new Pinecone();

  type PDFPage = {
    pageContent: string;
    metadata: {
        loc: {pageNumber: number}
    }
}

  export default async function loadS3IntoPinecone(fileKey: string) {
    //1. obtain the pdf -> read and download the pdf
    const fileName = await downloadFromS3(fileKey);
    if(!fileName) {
        throw new Error("couldn't download from the S3")
    }
    const loader = new PDFLoader(fileName);
    const pages = (await loader.load()) as PDFPage[];

    //2. split and segment the document
    const documents = await Promise.all(pages.map(prepareDocument));

    // 3. vectorise and embed individual documents
    const vectors = await Promise.all(documents.flat().map(embedDocument));

    // 4. upload to pinecone
    const index = await pinecone.index('pdf--chat-box');
    const namespace = index.namespace(convertToAscii(fileKey));

    console.log("inserting vectors into pinecone");
    await namespace.upsert(vectors);

    return documents[0];

  }

  async function embedDocument(doc: Document) {
    try {
      const embeddings = await getEmbeddings(doc.pageContent);
      const hash = md5(doc.pageContent);
  
      return {
        id: hash,
        values: embeddings,
        metadata: {
          text: doc.metadata.text,
          pageNumber: doc.metadata.pageNumber,
        },
      } as PineconeRecord;
    } catch (error) {
      console.log("error embedding document", error);
      throw error;
    }
  }
  

  export const truncateStringByBytes = (str: string, bytes: number) => {
    const enc = new TextEncoder();
    return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
  };

  async function prepareDocument(page: PDFPage) {
    let { pageContent, metadata } = page;
    pageContent = pageContent.replace(/\n/g, "");
    // split the docs
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = await splitter.splitDocuments([
      new Document({
        pageContent,
        metadata: {
          pageNumber: metadata.loc.pageNumber,
          text: truncateStringByBytes(pageContent, 36000),
        },
      }),
    ]);
    return docs;
  }