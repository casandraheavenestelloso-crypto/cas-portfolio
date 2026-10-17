import AppKit
import CoreText
import PDFKit
let root = FileManager.default.currentDirectoryPath + "/"
let data = try Data(contentsOf: URL(fileURLWithPath: root + "assets/resume/resume-data.json"))
let d = try JSONSerialization.jsonObject(with:data) as! [String:Any]
let output = root + "assets/resume/Estelloso_WebDev_Resume.pdf"
var box = CGRect(x:0,y:0,width:595,height:842)
let ctx = CGContext(URL(fileURLWithPath: output) as CFURL, mediaBox:&box, [kCGPDFContextTitle: "Casandra Heaven R. Estelloso — Resume",kCGPDFContextAuthor:"Casandra Heaven R. Estelloso"] as CFDictionary)!
let text = NSMutableAttributedString(string:"")
func add(_ value:String, size:CGFloat = 10, bold:Bool = false, after:CGFloat = 7) {
 let p = NSMutableParagraphStyle(); p.lineSpacing = 3; p.paragraphSpacing = after
 text.append(NSAttributedString(string:value + "\n", attributes:[.font:bold ? NSFont.boldSystemFont(ofSize:size):NSFont.systemFont(ofSize:size), .foregroundColor:NSColor(calibratedWhite:0.13,alpha:1), .paragraphStyle:p]))
}
func heading(_ s:String) { add(s.uppercased(),size:11,bold:true,after:10) }
heading("Professional overview");add(d["overview"] as! String,after:16)
heading("Professional experience")
for job in d["experience"] as! [[String:Any]] {
 add((job["role"] as! String) + " — " + (job["company"] as! String),size:10.5,bold:true,after:2)
 add(job["dates"] as! String,size:9,after:5)
 for b in job["bullets"] as! [String] { add("• " + b,after:5) }
 add("",size:3,after:4)
}
heading("Technical skills")
for pair in d["skills"] as! [[String]] { add(pair[0] + ": " + pair[1],after:6) }
add("",size:3,after:4)
heading("Education")
let ed = d["education"] as! [String:String]
add(ed["degree"]!,bold:true,after:3);add(ed["school"]! + " | " + ed["dates"]!,after:3);add(ed["honors"]!,after:16)
heading("Selected honors")
for award in d["awards"] as! [String] { add("• " + award,after:5) }
let firstPageEnd = (text.string as NSString).range(of:"News Writer & Ascribe Head — Tigris Publication").location
let fs = CTFramesetterCreateWithAttributedString(text)
var offset = 0; var page = 0
func draw(_ value:String, rect:CGRect, size:CGFloat, bold:Bool = false) {
 let attr=NSAttributedString(string:value,attributes:[.font:bold ? NSFont.boldSystemFont(ofSize:size):NSFont.systemFont(ofSize:size), .foregroundColor:NSColor(calibratedWhite:0.13,alpha:1)])
 let f=CTFramesetterCreateWithAttributedString(attr);let path=CGPath(rect:rect,transform:nil);CTFrameDraw(CTFramesetterCreateFrame(f,CFRange(location:0,length:0),path,nil),ctx)
}
while offset < text.length {
 page += 1; ctx.beginPDFPage(nil);ctx.textMatrix = .identity
 var top:CGFloat = 790
 if page == 1 {
  draw((d["name"] as! String).uppercased(),rect:CGRect(x:44,y:750,width:395,height:48),size:18,bold:true)
  draw(d["role"] as! String,rect:CGRect(x:44,y:725,width:395,height:26),size:12,bold:true)
  draw("Bacolod City, Philippines | +63 928 570 4241\ncasandraheavenestelloso@gmail.com\nLinkedIn: linkedin.com/in/casandra-heaven-estelloso-490432368/\nGitHub: github.com/casandraheavenestelloso-crypto",rect:CGRect(x:44,y:651,width:395,height:75),size:8.5)
  if let img=NSImage(contentsOfFile:root+"assets/images/Casandra Heaven Estelloso - Web Developer Formal.jpeg"), let cg=img.cgImage(forProposedRect:nil,context:nil,hints:nil) { ctx.draw(cg,in:CGRect(x:458,y:706,width:93,height:93)) }
  top = 640
 } else {
  draw("CASANDRA HEAVEN R. ESTELLOSO | RESUME",rect:CGRect(x:44,y:797,width:507,height:18),size:8,bold:true)
 }
 let path=CGPath(rect:CGRect(x:44,y:48,width:507,height:top-48),transform:nil)
 let length = page == 1 ? firstPageEnd - offset : 0
 let frame=CTFramesetterCreateFrame(fs,CFRange(location:offset,length:length),path,nil)
 CTFrameDraw(frame,ctx);let range=CTFrameGetVisibleStringRange(frame)
 if range.length == 0 { fatalError("PDF content did not fit") }
 offset += range.length
 draw("Casandra Heaven R. Estelloso | Page \(page)",rect:CGRect(x:44,y:20,width:507,height:15),size:8)
 ctx.endPDFPage()
}
ctx.closePDF()
let pdf=PDFDocument(url:URL(fileURLWithPath:output))!
if let first = pdf.page(at:0) {
 for (label,url) in [("casandraheavenestelloso@gmail.com","mailto:casandraheavenestelloso@gmail.com"),("linkedin.com/in/casandra-heaven-estelloso-490432368/","https://www.linkedin.com/in/casandra-heaven-estelloso-490432368/"),("github.com/casandraheavenestelloso-crypto","https://github.com/casandraheavenestelloso-crypto")] {
  if let selection=pdf.findString(label,withOptions:[]).first {
   let a=PDFAnnotation(bounds:selection.bounds(for:first),forType:.link,withProperties:nil)
   a.url=URL(string:url);a.border=PDFBorder();a.border?.lineWidth=0;first.addAnnotation(a)
  }
 }
}
pdf.write(to:URL(fileURLWithPath:output))
let extracted=(0..<pdf.pageCount).compactMap{pdf.page(at:$0)?.string}.joined(separator:"\n")
for term in ["POST Inc.","Magna Cum Laude","2025", "Technical" ] { if !extracted.localizedCaseInsensitiveContains(term) { fatalError("Missing PDF content: " + term) } }
print("Created and verified updated PDF: \(pdf.pageCount) pages")
