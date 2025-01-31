import React, { Fragment } from 'react'
import { Image, Text, View, Page, Document, StyleSheet } from '@react-pdf/renderer';
import logo from '../../assets/matchpoint-logo.png';

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getUTCDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getUTCFullYear();
        return `${day} ${month} ${year}`;
    };

  const Invoice = ({row}) => {

    const reciept_data = {
        "id":row.c2c_invoice_id,
        "invoice_no": row.c2c_invoice_id,
        "bill_to_address": row.client_name,
        "invoice_date": formatDate(row.c2c_invoice_generated_on),
        "invoice_due_date": "--",
        "project_name": row.c2c_invoice_contract_name,
        "po_no":row.purchase_order_number,
        "phone_no":"1234567890",
        "items": [
          {
            "id": 1,
            "desc": "-",
            "hrs": row.c2c_total_hours_count,
            "serviced":"-",
            "rate": "-",
            "amount":parseFloat(row.c2c_invoice_amount),
          },
        ]
      }

    const styles = StyleSheet.create({
        page: {fontSize: 11,paddingTop: 20,paddingLeft: 40,paddingRight: 40,lineHeight: 1.5,flexDirection: 'column' },

        spaceBetween : {flex : 1,flexDirection: 'row',alignItems:'center',justifyContent:'space-between',color: "#3E3E3E" },

        titleContainer: {flexDirection: 'row',marginTop: 24},
        
        logo: { width: 90 },

        reportTitle: {  fontSize: 16,  textAlign: 'center' },

        addressTitle : {fontSize: 11,fontStyle: 'bold'}, 
        
        invoice : {fontWeight: 'bold',fontSize: 20},
        
        invoiceNumber : {fontSize: 11,fontWeight: 'bold'}, 
        
        address : { fontWeight: 400, fontSize: 10},
        
        theader : {marginTop : 20,fontSize : 10,fontStyle: 'bold',paddingTop: 4 ,paddingLeft: 7 ,flex:1,height:20,backgroundColor : '#DEDEDE',borderColor : 'whitesmoke',borderRightWidth:1,borderBottomWidth:1},

        theader2 : { flex:2, borderRightWidth:0, borderBottomWidth:1},

        tbody:{ fontSize : 9, paddingTop: 4 , paddingLeft: 7 , flex:1, borderColor : 'whitesmoke', borderRightWidth:1, borderBottomWidth:1},

        total:{ fontSize : 9, paddingTop: 4 , paddingLeft: 7 , flex:1.5, borderColor : 'whitesmoke', borderBottomWidth:1},

        tbody2:{ flex:2, borderRightWidth:1, }
        
    });

    const InvoiceTitle = () => (
        <View style={styles.titleContainer}>
            <View style={styles.spaceBetween}>
                <Text style={styles.reportTitle}>MatchPoint Solution</Text>
                <Image style={styles.logo} src={logo} />
            </View>
        </View>
    );

    const Address = () => (
        <View style={styles.titleContainer}>
            <View style={styles.spaceBetween}>
                <View>
                    <Text style={styles.addressTitle}>3875,Hopyard Rd Suite 325, </Text>
                    <Text style={styles.addressTitle}>Pleasanton CA 94588.</Text>
                </View>
                <View>
                    <Text style={styles.invoice}>Invoice </Text>
                    <Text style={styles.invoiceNumber}>Invoice Number: {reciept_data.invoice_no} </Text>
                    <Text style={styles.invoiceNumber}>Invoice Date: {reciept_data.invoice_date} </Text>
                    <Text style={styles.invoiceNumber}>Due Date: {reciept_data.invoice_due_date} </Text>
                    <Text style={styles.invoiceNumber}>Project: {reciept_data.project_name} </Text>
                    <Text style={styles.invoiceNumber}>P.O.Number:{reciept_data.po_no} </Text>
                </View>
            </View>
        </View>
    );

    const UserAddress = () => (
        <View style={styles.titleContainer}>
            <View style={styles.spaceBetween}>
                <View style={{maxWidth : 200}}>
                    <Text style={styles.addressTitle}>Bill To: </Text>
                    <Text style={styles.address}>
                        {reciept_data.bill_to_address}
                    </Text>
                </View>
                <></>
            </View>
        </View>
    );


    const TableHead = () => (
        <View style={{ width:'100%', flexDirection :'row', marginTop:10}}>
            <View style={[styles.theader, styles.theader2]}>
                <Text>Description</Text>   
            </View>
            <View style={styles.theader}>
                <Text>Hours/Qty </Text>   
            </View>
            <View style={styles.theader}>
                <Text>Rate</Text>   
            </View>
            <View style={styles.theader}>
                <Text>Serviced</Text>   
            </View>
            <View style={styles.theader}>
                <Text>Amount</Text>   
            </View>
        </View>
    );


    const TableBody = () => (
       reciept_data.items.map((receipt)=>(
        <Fragment key={receipt.id}>
            <View style={{ width:'100%', flexDirection :'row'}}>
                <View style={[styles.tbody, styles.tbody2]}>
                    <Text >{receipt.desc}</Text>   
                </View>
                <View style={styles.tbody}>
                    <Text>{receipt.hrs}</Text>   
                </View>
                <View style={styles.tbody}>
                    <Text>{receipt.rate} </Text>   
                </View>
                <View style={styles.tbody}>
                    <Text>{receipt.serviced}</Text>   
                </View>

                <View style={styles.tbody}>
                    <Text>{(receipt.amount)}</Text>   
                </View>
            </View>
        </Fragment>
       ))
    );

    const TableTotal = () => (
        <View style={{ width:'100%', flexDirection :'row'}}>
            <View style={styles.total}>
                <Text></Text>   
            </View>
            <View style={styles.total}>
                <Text> </Text>   
            </View>
            <View style={styles.total}>
                <Text> </Text>   
            </View>
            <View style={styles.tbody}>
                <Text>Total $ </Text>   
            </View>
            <View style={styles.tbody}>
                <Text>
                    {reciept_data.items.reduce((sum, item)=> sum + (item.amount), 0)}
                </Text>  
                
            </View>
        </View>
    );

    const TableBalenceDue = () => (
        <View style={{ width:'100%', flexDirection :'row'}}>
            <View style={styles.total}>
                <Text></Text>   
            </View>
            <View style={styles.total}>
                <Text> </Text>   
            </View>
            <View style={styles.total}>
                <Text> </Text>   
            </View>
            <View style={styles.tbody}>
                <Text>Balence Due $</Text>   
            </View>
            <View style={styles.tbody}>
                <Text>
                    {reciept_data.items.reduce((sum, item)=> sum + (item.amount), 0)}
                </Text>  
                
            </View>
        </View>
    );

    const TablePayementsCredits = () => (
        <View style={{ width:'100%', flexDirection :'row'}}>
            <View style={styles.total}>
                <Text></Text>   
            </View>
            <View style={styles.total}>
                <Text> </Text>   
            </View>
            <View style={styles.total}>
                <Text> </Text>   
            </View>
            <View style={styles.tbody}>
                <Text>Payments/Credits $</Text>   
            </View>
            <View style={styles.tbody}>
                <Text>
                    0
                </Text>  
                
            </View>
        </View>
    );

    const ThankYou=()=>{
        return(
            <div style={{ flexDirection: 'column' }}>
                <Text >Thank you for your business</Text>
                <Text> Phone : {reciept_data.phone_no}</Text>

            </div>
        )
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <InvoiceTitle  />
                <Address/>
                <UserAddress/>
                <TableHead/>
                <TableBody/>
                <TableTotal/>
                <TablePayementsCredits />
                <TableBalenceDue />  
                <ThankYou />
            </Page>
        </Document>
          
    )
}

export default Invoice;