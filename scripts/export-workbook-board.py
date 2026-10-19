"""Read saved Excel values only; never changes the source workbook or macros."""
import argparse,datetime,json,posixpath,xml.etree.ElementTree as E,zipfile
from pathlib import Path
NS={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
def extract(source):
 with zipfile.ZipFile(source) as z:
  shared=[''.join(t.text or '' for t in item.findall('.//m:t',NS)) for item in E.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si',NS)] if 'xl/sharedStrings.xml' in z.namelist() else []
  rels={r.attrib['Id']:posixpath.normpath(posixpath.join('xl',r.attrib['Target'])) if not r.attrib['Target'].startswith('/') else r.attrib['Target'].lstrip('/') for r in E.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
  sheets={s.attrib['name']:rels[s.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']] for s in E.fromstring(z.read('xl/workbook.xml')).find('m:sheets',NS)}
  result={'title':'Barnes Pool Results','season':2026,'updatedAt':datetime.datetime.fromtimestamp(Path(source).stat().st_mtime,datetime.timezone.utc).isoformat(),'weeks':[]}
  def col(n):
   out=''
   while n:n,k=divmod(n-1,26);out=chr(65+k)+out
   return out
  def num(v):return int(v) if v not in ('',None) and str(v).replace('.','',1).isdigit() and float(v).is_integer() else None
  for period in range(1,23):
   name='Week '+str(period) if period<=18 else ['Wild Card','Divisional','Conf Championships','Super Bowl'][period-19]
   if name not in sheets:continue
   cells={}
   for c in E.fromstring(z.read(sheets[name])).findall('.//m:sheetData/m:row/m:c',NS):
    v=c.find('m:v',NS);value=v.text or '' if v is not None else ''.join(t.text or '' for t in c.findall('.//m:t',NS))
    if c.attrib.get('t')=='s':value=shared[int(value)] if value else ''
    if c.attrib.get('t')=='e':raise ValueError('Save a workbook with no cell errors before publishing: '+name+'!'+c.attrib['r'])
    cells[c.attrib['r']]=value
   rows=[r for r in range(8,32) if cells.get('B'+str(r)) and cells.get('C'+str(r))]
   games=[{'away':cells['B'+str(r)],'home':cells['C'+str(r)],'winner':cells.get('D'+str(r),'') or '','awayScore':None,'homeScore':None} for r in rows]
   players=[]
   for c in range(5,205,2):
    letter=col(c);player=cells.get(letter+'6','')
    if player:players.append({'name':player,'picks':[cells.get(letter+str(r),'') or '' for r in rows],'tie':num(cells.get(letter+'32'))})
   result['weeks'].append({'number':period,'label':name,'games':games,'players':players,'finalTotal':num(cells.get('E4'))})
  return result
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('source');parser.add_argument('output');args=parser.parse_args()
 data=extract(args.source);Path(args.output).parent.mkdir(parents=True,exist_ok=True);Path(args.output).write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
 print('Exported',len(data['weeks']),'weeks; names, picks and results only. Source workbook unchanged.')
