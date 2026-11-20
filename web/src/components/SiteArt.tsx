import Image from "next/image";

export default function SiteArt({ file, className = "", alt = "" }: { file: string; className?: string; alt?: string }) {
  return <div className={`art ${className}`}><Image src={`/assets/${file}`} alt={alt} fill sizes="(max-width: 700px) 90vw, 600px" /></div>;
}
