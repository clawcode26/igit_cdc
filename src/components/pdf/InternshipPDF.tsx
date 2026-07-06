import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Times-Roman', fontSize: 12, lineHeight: 1.5, color: '#000' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1.5, borderBottomColor: '#000', paddingBottom: 15 },
  logo: { width: 65, height: 65, marginRight: 12 },
  headerTextContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  deptName: { fontFamily: 'Times-Bold', fontSize: 16, marginBottom: 6, textTransform: 'uppercase' },
  instName: { fontFamily: 'Times-Bold', fontSize: 16, textTransform: 'uppercase' },
  addressBlock: { marginBottom: 20, fontSize: 12, lineHeight: 1.5 },
  subject: { fontSize: 12, marginBottom: 25 },
  body: { fontSize: 12, lineHeight: 1.6, marginBottom: 20, textAlign: 'justify' },
  nbText: { fontSize: 12, fontFamily: 'Times-Bold', marginBottom: 40 },
  footerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 40 },
  signBlock: { alignItems: 'flex-end', fontSize: 12 },
  thankYou: { fontSize: 12 },
})

export const InternshipPDF = ({ data, profile }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.headerContainer}>
        <Image src="/igit-logo.png" style={styles.logo} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.deptName}>Career Development Centre</Text>
          <Text style={styles.instName}>Indira Gandhi Institute of Technology, Sarang</Text>
        </View>
      </View>

      <View style={styles.addressBlock}>
        <Text>To,</Text>
        <Text>{data.designation},</Text>
        <Text>{data.address}.</Text>
      </View>

      <Text style={styles.subject}>
        Sub: Request for Industrial Training/Internship of B.Tech students during Summer Vacation-{data.startDate ? new Date(data.startDate).getFullYear() : new Date().getFullYear()}.
      </Text>

      <Text style={styles.body}>
        Sir/Madam,{'\n\n'}
        I am pleased to introduce Mr./Miss. <Text style={{ fontFamily: 'Times-Bold' }}>{profile.full_name}</Text>, <Text style={{ fontFamily: 'Times-Bold' }}>{data.semester} Semester</Text>, <Text style={{ fontFamily: 'Times-Bold' }}>{profile.department}</Text> bearing University Registration no. : <Text style={{ fontFamily: 'Times-Bold' }}>{profile.registration_no || profile.roll_no}</Text> (Mob: <Text style={{ fontFamily: 'Times-Bold' }}>{profile.phone}</Text>, E-mail: <Text style={{ fontFamily: 'Times-Bold' }}>{profile.email}</Text>) who is interested to take Industrial/Internship training in your prestigious organization during the ensuing Summer Vacation {data.startDate ? new Date(data.startDate).getFullYear() : new Date().getFullYear()} for about one month / within the duration as a part of their academic curriculum. He/she is sincere and bears a good moral character. I therefore, request you to kindly allot seat to the above student.
      </Text>

      <Text style={styles.nbText}>
        N.B.: The duration of Internship will be from {data.startDate ? new Date(data.startDate).toLocaleDateString('en-GB') : ''} to {data.endDate ? new Date(data.endDate).toLocaleDateString('en-GB') : ''}. (B.Tech).
      </Text>

      <View style={{ alignItems: 'flex-end', marginBottom: 40 }}>
        <Text>Yours Sincerely,</Text>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.thankYou}>Thanking You.</Text>
        <View style={styles.signBlock}>
          <Text>(Prof. In-Charge)</Text>
          <Text>Professor In-Charge</Text>
          <Text>Career Development Centre</Text>
          <Text>(Training & Placement Cell)</Text>
          <Text>IGIT Sarang</Text>
        </View>
      </View>
    </Page>
  </Document>
)
