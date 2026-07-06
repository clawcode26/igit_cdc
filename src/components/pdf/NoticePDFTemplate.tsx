import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 60,
    paddingLeft: 30,
    paddingRight: 30,
    fontFamily: 'Times-Roman',
    fontSize: 12,
    lineHeight: 1.5,
    color: '#000',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 65,
    height: 65,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deptName: {
    fontFamily: 'Times-Bold',
    fontSize: 16,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  instName: {
    fontFamily: 'Times-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderBottomColor: '#000',
    paddingBottom: 15,
    marginBottom: 20,
  },
  refText: {
    fontFamily: 'Times-Bold',
    fontSize: 11,
  },
  docTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 25,
    textDecoration: 'underline',
    textTransform: 'uppercase',
  },
  forToText: {
    fontFamily: 'Times-Bold',
    fontSize: 12,
    marginBottom: 15,
  },
  subjectContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  subjectLabel: {
    fontFamily: 'Times-Bold',
    width: 60,
  },
  subjectText: {
    flex: 1,
    fontFamily: 'Times-Bold',
  },
  bodyText: {
    marginTop: 10,
    textAlign: 'justify',
    fontSize: 12,
    marginBottom: 40,
    lineHeight: 1.6,
  },
  footerSignature: {
    position: 'absolute',
    bottom: 80,
    right: 40,
    alignItems: 'center',
  },
  signatoryName: {
    fontFamily: 'Times-Bold',
    fontSize: 12,
    marginBottom: 5,
  },
  signatoryTitle: {
    fontFamily: 'Times-Roman',
    fontSize: 11,
  },
  nbContainer: {
    position: 'absolute',
    bottom: 40,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
  },
  nbText: {
    fontFamily: 'Times-Italic',
    fontSize: 10,
  },
  watermark: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    width: 350,
    opacity: 0.05,
  },
})

interface NoticeProps {
  refNo: string
  dateIssued: string
  forTo: string
  subject: string
  body: string
  undersigned: string
  designation?: string
  department?: string
  nbNote: string
  hasLink?: boolean
  linkUrl?: string
}

// Helper to inject regular spaces into long continuous strings (like URLs or test gibberish)
// so that React-PDF's Yoga layout engine can properly wrap them instead of overflowing.
const wrapLongText = (str: string) => {
  if (!str) return str;
  return str.replace(/(\S{35})/g, "$1 ");
}

export const NoticePDFTemplate = ({ 
  refNo, dateIssued, forTo, subject, body, undersigned, designation, department, nbNote, positions, hasLink, linkUrl 
}: NoticeProps & { positions?: any }) => {
  const logoUrl = '/igit-logo.png' // Absolute path from public
  
  const pos = positions || {
    header: {x:0,y:0}, refRow: {x:0,y:0}, title: {x:0,y:0}, forTo: {x:0,y:0}, 
    subject: {x:0,y:0}, body: {x:0,y:0}, link: {x:0,y:0}, signature: {x:0,y:0}, nbNote: {x:0,y:0}
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={logoUrl} style={styles.watermark} />

        <View style={[styles.headerContainer, { left: pos.header.x, top: pos.header.y, position: 'relative' }]}>
          <Image src={logoUrl} style={styles.logo} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.deptName}>{department || 'Career Development Centre'}</Text>
            <Text style={styles.instName}>Indira Gandhi Institute of Technology, Sarang</Text>
          </View>
        </View>
        
        <View style={[styles.refRow, { left: pos.refRow.x, top: pos.refRow.y, position: 'relative' }]}>
          <Text style={styles.refText}>No. {refNo || 'IGIT/CDC/____'}</Text>
          <Text style={styles.refText}>Date: {dateIssued ? new Date(dateIssued).toLocaleDateString('en-GB') : 'DD/MM/YYYY'}</Text>
        </View>
        
        <Text style={[styles.docTitle, { left: pos.title.x, top: pos.title.y, position: 'relative' }]}>NOTICE</Text>
        
        {forTo && (
          <Text style={[styles.forToText, { left: pos.forTo.x, top: pos.forTo.y, position: 'relative' }]}>To: {wrapLongText(forTo)}</Text>
        )}

        <View style={[styles.subjectContainer, { left: pos.subject.x, top: pos.subject.y, position: 'relative' }]}>
          <Text style={styles.subjectLabel}>Sub:</Text>
          <Text style={styles.subjectText}>{wrapLongText(subject) || '...'}</Text>
        </View>

        <Text style={[styles.bodyText, { left: pos.body.x, top: pos.body.y, position: 'relative', marginBottom: hasLink ? 10 : 40 }]}>
          {wrapLongText(body) || 'Start typing the notice body...'}
        </Text>

        {hasLink && (
          <Text style={[{ left: pos.link.x, top: pos.link.y, position: 'relative', fontFamily: 'Times-Bold', fontSize: 12, marginBottom: 30, color: 'blue' }]}>
            Link: {wrapLongText(linkUrl) || 'https://'}
          </Text>
        )}

        {/* Note: footerSignature was already position: absolute, so we add to top/left instead of overriding relative */}
        <View style={[styles.footerSignature, { marginRight: -pos.signature.x, marginBottom: -pos.signature.y }]}>
          <Text style={styles.signatoryName}>{undersigned || 'Authorized Signatory'}</Text>
          {designation && (
            <Text style={styles.signatoryTitle}>{designation}</Text>
          )}
          <Text style={styles.signatoryTitle}>{department || 'Career Development Centre, IGIT Sarang'}</Text>
        </View>

        {nbNote && (
          <View style={[styles.nbContainer, { marginLeft: pos.nbNote.x, marginBottom: -pos.nbNote.y }]}>
            <Text style={styles.nbText}>N.B.: {nbNote}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
