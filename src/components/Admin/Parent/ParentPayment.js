import {Component} from 'react'
import axios from 'axios'
import qs from 'qs'
import { saveAs } from 'file-saver';
function saveByteArray(reportName, byte) {
    
    var blob = new Blob([byte], {type: "application/pdf"});
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
};
class ParentPayment extends Component {

    constructor(props){
        super(props)
        this.state  = {
            parents:null,
            students:null,
            chosenParents:[],
            chosenStudents:[],
            findBy:2,
            chosenParent:null,
            includeMonth:false,
            includeYear:false,
            inlcudeStudentsParents:false,
            invoices:null,
            invoicesCopy:null,
            showPaymentModal:false,
            modalIvoice:null,
            modalInvoiceIndex:null,
            modalPaidStatus:null,
            modalPaymentAmount:null,
            month:null,
            year:null,
            formSubmitted:false,
            options :{ authorization: this.props.token,userid:this.props.userId } 
        }
    }

    componentDidMount = async () =>{

        var queryString = qs.parse(window.location.search, { ignoreQueryPrefix: true })
        var pid = queryString.pid? queryString.pid : null
        var sid = queryString.sid? queryString.sid : null
        var month = queryString.month? queryString.month : null
        var year = queryString.year? queryString.year : null

        if(year != null){
            this.setState({year:year})
            this.setState({includeYear:true})
        }
        if(month != null){
            
            this.setState({month:month})
            this.setState({includeMonth:true})
        }
        if(sid != null){
            var list = []
            if(!Array.isArray(sid)){
                list = [sid]
            }else{
                list = sid
            }
            
            this.setState({chosenStudents:list})
            
        }
        if(pid != null){
            var list = []
            if(!Array.isArray(pid)){
                list = [pid]
            }else{
                list = pid
            }
            
            this.setState({chosenParents:list})
            this.setState({inlcudeStudentsParents:true})
            this.setState({findBy:0})
        }


       var parents = await this.getParents()
       this.setState({parents:parents})

       var students = await this.getStudents()
       this.setState({students:students})
    }

    getParents = async () =>{
        var parents = [];

        await  axios.get('/api/parents/all',
                {headers:this.state.options})
            .then(async (response) =>{
                parents = await response.data
            
            })

        return parents
    }

    getStudents = async () =>{
        var students = [];

        await  axios.get('/api/students/all',
                {headers:this.state.options})
            .then(async (response) =>{
                students = await response.data
            
            })

        return students
    }

    toggleShowPaymentModal = async (index = null,invoice = null) =>{
        this.setState({modalIvoice:invoice})
        this.setState({modalIvoiceIndex:index})
        this.setState({showPaymentModal:!this.state.showPaymentModal})
    }

    setModalPaymentAmount = async (e) =>{
        var amount = e.target.value;
        this.setState({modalPaymentAmount:amount})

    }

    resolveInvoice = async () =>{
         this.state.invoices[this.state.modalIvoiceIndex].paidStatus = await this.state.modalPaidStatus
         this.state.invoices[this.state.modalIvoiceIndex].paymentAmount = await this.state.modalPaymentAmount
         this.state.invoices[this.state.modalIvoiceIndex].changed = await true


         this.setState({modalInvoiceIndex:null})
         this.setState({modalPaymentAmount:null})
         this.setState({modalPaidStatus:null})
         this.setState({modalIvoice:null})
         this.toggleShowPaymentModal();
         
        
    }

    paidExact = async (index) =>{
        var  invoices = await this.state.invoices.slice()


        if(invoices[index].changed != null){
            invoices[index].paidStatus = null
            invoices[index].paymentAmount = null
            invoices[index].changed = null;

        }else{
         invoices[index].paidStatus = await 0
         invoices[index].paymentAmount = await invoices[index].total
         invoices[index].changed = true;
        }
         await this.setState({invoices:invoices})     
        
        
    }

    confirmPayment = async (e) =>{
        if(this.state.modalPaymentAmount != null){
        if(this.state.modalPaymentAmount != this.state.modalIvoice.total){
            if(this.state.modalPaidStatus ==1){
                if(this.state.modalPaymentAmount < this.state.modalIvoice.total){
                    await this.resolveInvoice();
                }else{
                    alert('too much')
                }
            }else if(this.state.modalPaidStatus ==2){
                if(this.state.modalPaymentAmount > this.state.modalIvoice.total){
                    await this.resolveInvoice();
                }else{
                    alert('too less')
                }
            }

        }else{
            alert('cannot add ')
        }
    }else{
        alert('no changes made');
    }

    }

    getInvoices = async  (e)=>{
        var qString = ""
        var year = null
        var month = null
        var sids = ""
        var pids = ""


        if(this.state.month != null && this.state.month != "0"){
            month = await this.state.month
            qString = await qString + "month=" +month+"&"
        }

        if(this.state.year != null && this.state.year != "0"){
            var year = await this.state.year
            qString = await qString + "year=" +year+"&"
        }
       
        if(this.state.chosenParents.length>0){
            await this.state.chosenParents.map(async(pid,index)=>{
                pids = await "pid="+pid.toString()+"&"
            })
        }

        if(this.state.chosenStudents.length>0){
            await this.state.chosenStudents.map( async(sid,index)=>{
                sids = await "sid="+sid.toString()+"&"
            })
        }
        await console.log(qString,sids,pids)
        await  axios.get('/api/preinvoices/get-pre-invoices',
                {headers:this.state.options})
            .then(async (response) =>{
               var invoices = await response.data
                console.log(invoices)
               this.setState({invoices:invoices})
               this.setState({invoicesCopy:invoices})
            
            })       
    }

  


    


    

    saveChanges = async (e) =>{

        var nonNullInvoices = await this.state.invoices?.filter(a=>a.changed != null)
        var changedInvoices = await nonNullInvoices?.filter(a=>a.changed == true)

        await changedInvoices?.map(async (invoice,index)=>{
            
            await  axios.get('/api/invoices/update-payment?id='+invoice._id+'&amount='+invoice.paymentAmount+'&status='+invoice.paidStatus,
                {headers:this.state.options})
            .then(async (response) =>{
                console.log(response.data)
                await this.setState({formSubmitted:true})
            
            })

        })


    }

    download =async (invoice) =>{
      
        var buffer = await invoice.data;
        var b64 = await Buffer.from(buffer).toString('base64')
       var base = await b64


       var blob = new Blob(["data:application/pdf;base64," + base],
                { type: "text/plain;charset=utf-8" });
                var fileURL = URL.createObjectURL(blob);
                window.open(fileURL);
                saveAs(blob, "static.txt");
  
    }

    filterInvoices = (type) =>{

        
        switch(parseInt(type)){

            case 0://paid exact
                var invoices = this.state.invoicesCopy.filter((i)=>i.paidStatus == 0)
                this.setState({invoices:invoices})
                break

            case 1://paid exact
            var invoices = this.state.invoicesCopy.filter((i)=>i.paidStatus == 1)
            this.setState({invoices:invoices})
                break

            case 2://paid exact
                var invoices = this.state.invoicesCopy.filter((i)=>i.paidStatus == 2)
                this.setState({invoices:invoices})
                break

            default://paid exact
             
                this.setState({invoices:this.state.invoicesCopy})
                break
         



            


        }

    }


    render(){
        return(
        <div className="container">
            <h1>Parent Payment Editor</h1>

            
        </div>)
    }


}

export default ParentPayment