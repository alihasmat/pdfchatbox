
type Props = {
    pdf_url: string,
}

export default function PdfViewer({pdf_url}: Props) {
    return (
        <iframe 
        src={`https://docs.google.com/viewer?url=${pdf_url}&embedded=true`}
        className="w-full h-full"></iframe>
    )
}