import {Component} from 'react'
import axios from 'axios'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, NavItem } from 'reactstrap';
import qs from 'qs'
import { saveAs } from 'file-saver';
import Months from '../../Enums/Months'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faCheck } from '@fortawesome/free-solid-svg-icons'
import dayjs from 'dayjs'
import DatePicker from "react-datepicker";
import InvoiceType from '../../Enums/InvoiceTypes';
class PreInvoicePaymentPanel extends Component {

    constructor(props){
        super(props)
        this.state  = {
            fromDate: new Date(),
            toDate:new Date(),
            parents:null,
            students:null,
            chosenParentId:null,
            chosenStudentId:null,
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
            invoicesSent: false,
            fetchingInvoices: false,
            isPreview: true,
            justSent:[],
            invoiceType:null,
            showReInvoiceModal:false,
            chosenReInvoice:null,
            reInvoiceFromDate:null,
            reInvoiceToDate:null,
            previewReinvoiceData:null,
            options :{ authorization: this.props.token,userid:this.props.userId } 
        }
    }

    // Write, Edit and Run your Javascript code using JS Online Compiler
        // var batches = [1,2,3,4,5]
        // var i = 0;                  //  set your counter to 1

        // function myLoop() {         //  create a loop function
        // setTimeout(function() {   //  call a 3s setTimeout when the loop is called
        //     console.log(batches[i]);   //  your code here
        //     i++;                    //  increment the counter
        //     if (i < batches.length) {           //  if the counter < 10, call the loop function
        //     myLoop();             //  ..  again which will trigger another 
        //     }                       //  ..  setTimeout()
        // }, 500)
        // }

        // myLoop();  

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

       var toDate = new Date()
       toDate.setDate(25)
       toDate.setMonth((new Date()).getMonth())
       this.setState({toDate: toDate})

       var fromDate = new Date()
       fromDate.setDate(26)
       fromDate.setMonth((new Date()).getMonth()-1)
       this.setState({fromDate: fromDate})    
       await this.getInvoiceType(fromDate, toDate)


    }

    chooseParent = async (index) =>
    {

        if(index != null && index >= 0)
        {   
            var chosenParents = this.state.chosenParents;
            var chosenParentId = this.state.parents[index]._id

            if(chosenParentId != null)
            {        
                this.setState({chosenParentId: chosenParentId})
            }
            
        }else
        {
            alert("no parent found!")
        }

    }

    chooseStudent = async (index) =>
    {

        if(index != null && index >= 0)
        {   
            var chosenStudents = this.state.chosenStudents;
            var chosenStudentId = this.state.students[index]._id

            if(chosenStudentId != null)
            {
                this.setState({chosenStudentId: chosenStudentId})
            }
            
        }else
        {
            alert("no student found!")
        }

    }



    getInvoiceType= async (fromDate, toDate) => {
        var now = dayjs()
        var fromDate = dayjs(fromDate)
        var toDate = dayjs(toDate)
        var invoicetype = InvoiceType.Mixed

        if(fromDate.isBefore(now) && toDate.isBefore(now))
        {
            invoicetype = InvoiceType.PostInvoice
        }

        if(now.isBefore(fromDate) && now.isBefore(toDate))
        {
            invoicetype = InvoiceType.PreInvoice
        }

        await this.setState({invoiceType: invoicetype})
    }


    sendInvoices = async (e) =>{
        var invoices = this.state.invoices
        var options = this.state.options
        this.setState({justSent:[]})
        await this.setState({invoicesSent:true})

        var justSent = []
    
        var i = 0;
    
         this.sendInvoice=()=>{
        
            setTimeout(async()=>{
                var invoice = invoices[i]

                
                await  axios.get('/api/preinvoicesstripe/send-pre-invoice?id='+invoice._id,
                {headers:options}).then((response)=>{
                    console.log(response.data.firstName)
                })                
            
            
            
            i++;
            if(i < invoices.length){
                this.sendInvoice();
                
              }


            }, 200)

        }
       
        this.sendInvoice();


        setTimeout(()=>{this.setState({invoicesSent: false})}, 20000);
        
        setTimeout(this.getInvoices, 50000);
         this.state.invoicesSent = true
         
     
    
    }

    createPreInvoices = async (e, isPreview = false) =>{

        if(this.state.fromDate != null && this.state.toDate != null){
                
            await  axios.get('/api/preinvoicesstripe/get-lessons-by-parent?fromDate='+this.state.fromDate
            +'&toDate='+this.state.toDate
            +'&isPreview='+isPreview 
            +'&invoiceType='+this.state.invoiceType,
                {headers:this.state.options})
            .then(async (response) =>{            
            
                const interval = setInterval(function() {
                    // method to be executed;
                    this.getInvoices()
                  }, 3);

            })

        }else{
            alert('null Dates')
        }
        
        
    }

    previewInvoiceData = async () =>
    {
        if(this.state.fromDate != null && this.state.toDate != null){
                
            await  axios.get('/api/preinvoicesstripe/preview-get-lessons-by-parent?fromDate='+this.state.fromDate
            +'&toDate='+this.state.toDate
            +'&invoiceType='+this.state.invoiceType,
                {headers:this.state.options})
            .then(async (response) =>{            
            
                        console.log(response.data)

            })

        }else{
            alert('null Dates')
        }
        
    }

    checkForPreInvoiceIssues = async (e) =>{

    
        if(this.state.fromDate != null && this.state.toDate != null){
                  
            await  axios.get('/api/preinvoicesstripe/check-for-invoiced-lessons?fromDate='+
            this.state.fromDate+'&toDate='+this.state.toDate,
                {headers:this.state.options})
            .then(async (response) =>{
              
            
                      console.log(response.data)

            })

        }else{
            alert('null Dates')
        }
        
        
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

        var hasValue = false;

        if(this.state.month != null && this.state.month != -1){
            qString = await qString + "month=" + this.state.month
            hasValue = true;
        }

        if(this.state.year != null && this.state.year != -1){
            if(hasValue){
                qString += "&"
            }
            qString = await qString + "year=" + this.state.year
            hasValue = true;
        }

        if(this.state.chosenParentId != null)
        {
            if(hasValue){
                qString += "&"
            }
            qString = await qString + "parent=" + this.state.chosenParentId
            hasValue = true;
        }

        if(this.state.chosenStudentId != null)
        {
            if(hasValue){
                qString += "&"
            }
            qString = await qString + "student=" + this.state.chosenStudentId
        }

        console.log(qString)
        await  axios.get('/api/preinvoicesstripe/get-pre-invoices?'+qString,
                {headers:this.state.options})
            .then(async (response) =>{
               var invoices = await response.data
                console.log(response.data)
               this.setState({invoices:invoices})
               this.setState({invoicesCopy:invoices})

               setTimeout(()=>{this.setState({fetchingInvoices: false})}, 3000);
               await this.setState({fetchingInvoices:true})
               
            
            })       
    } 


    

    saveChanges = async (e) =>{

        var nonNullInvoices = await this.state.invoices?.filter(a=>a.changed != null)
        var changedInvoices = await nonNullInvoices?.filter(a=>a.changed == true)

        await changedInvoices?.map(async (invoice,index)=>{

            var obj = {paymentAmount: invoice.paymentAmount, paidStatus: invoice.paidStatus}
            
            await  axios.post('/api/preinvoicesstripe/update-pre-invoices?id='+invoice._id,
                {headers:this.state.options, data: obj})
            .then(async (response) =>{
                setTimeout(this.getInvoices, 5000);
                setTimeout(()=>{this.setState({formSubmitted: false})}, 6000);
                await this.setState({formSubmitted:true})
            
            })

        })


    }
    downloadPdf =async (invoice) =>{
      
        var buffer = await invoice.data;
        var b64 = await Buffer.from(buffer).toString('base64')
       var base = await b64
        console.log(base)
       window.open("data:application/pdf;base64," + base);
  
    }

    downloadPdf2 =async (invoice) =>{
      if(invoice.data == null){
        alert('no invoice')
        return
    }
        var buffer = await invoice.data;
        var b64 = (buffer).toString('base64')
       var base = await b64
        //console.log(base)
       //window.open("data:application/pdf;base64," + base);
        var link = document.createElement('a');
        link.href = "data:application/pdf;base64," + base;
        link.download = invoice.parent.firstName+"_"+invoice.parent.lastName+'.pdf';
        link.dispatchEvent(new MouseEvent('click'));
  
    }

    download =async (invoice) =>{
      
        var buffer = await invoice.data;
        var b64 = await Buffer.from(buffer).toString('base64')
       var base = await b64


       var blob = new Blob(["data:application/pdf;base64," + base],
                { type: "text/plain;charset=utf-8" });
                var fileURL = URL.createObjectURL(blob);
                window.open(fileURL);
                saveAs(blob, "static.pdf");
  
    }

    calculateBalance = (invoice) =>{
        var preInvoiceAmount = invoice.total
        var postInvoiceAmount = invoice.postInvoice[0]?.total
        var paidAmount = invoice.paymentAmount;

        var adjustmentFromPayment = Math.abs(paidAmount - preInvoiceAmount);
        var adjustmentFromInvoice = Math.abs(postInvoiceAmount - preInvoiceAmount)

        if(paidAmount < preInvoiceAmount){
            adjustmentFromPayment *= -1
        }

        if(postInvoiceAmount > preInvoiceAmount){
            adjustmentFromInvoice *= -1
        }
        return adjustmentFromInvoice + adjustmentFromPayment;
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

    filter = (e) =>{
        var searchString = e.target.value.toString().toLowerCase()
        var invoices = this.state.invoicesCopy;
        var filteredInvoices = invoices?.filter(x => 
            x.parent.firstName.toLowerCase().includes(searchString) 
        || x.parent.lastName.toLowerCase().includes(searchString)
        || x.studentString.toLowerCase().includes(searchString))

        this.setState({invoices: filteredInvoices})

    }

    updateDate = async (date, isFromDate = true) => 
    {
        if(isFromDate)
        {
            await this.setState({fromDate: date})
            await this.getInvoiceType(date, this.state.toDate)
        }
        else
        {
            await this.setState({toDate: date})
            await this.getInvoiceType(this.state.fromDate, date)
        }        
        
    }

    toggleReInvoiceModal = async (index) => 
    {
        var invoice = this.state.invoices[index]
        this.setState({chosenReInvoice: invoice})
        this.setState({showReInvoiceModal: !this.state.showReInvoiceModal})
    }

    previewReinvoice = async () =>
    {
        var invoiceId = this.state.chosenReInvoice._id;
        var fromDate = dayjs(this.state.reInvoiceFromDate)
        var toDate = dayjs(this.state.reInvoiceToDate)
        
      
        var fromDay = fromDate.get('date')
        var fromMonth = fromDate.get('month')
        var fromYear = fromDate.get('year')

        var toDay = toDate.get('date')
        var toMonth = toDate.get('month')
        var toYear = toDate.get('year')

        var url = `/api/preinvoicesstripe/reinvoice/${invoiceId}/${fromDay}/${fromMonth}/${fromYear}/${toDay}/${toMonth}/${toYear}`
        await  axios.get(url,
        {headers:this.state.options, data: null})
        .then(async (response) =>{
       
       this.setState({previewReinvoiceData: response.data})
    
    })
    }

    createNewPreInvoice = async () =>
    {
        var invoiceId = this.state.chosenReInvoice._id;
        var fromDate = dayjs(this.state.reInvoiceFromDate)
        var toDate = dayjs(this.state.reInvoiceToDate)
        
      
        var fromDay = fromDate.get('date')
        var fromMonth = fromDate.get('month')
        var fromYear = fromDate.get('year')

        var toDay = toDate.get('date')
        var toMonth = toDate.get('month')
        var toYear = toDate.get('year')

        var url = `/api/preinvoicesstripe/reinvoiceconfirm/${invoiceId}/${fromDay}/${fromMonth}/${fromYear}/${toDay}/${toMonth}/${toYear}`
        await  axios.get(url,
        {headers:this.state.options, data: null})
        .then(async (response) =>{
       
       
    
        })
    }

    getInvoiceDetails = async (index) => 
    {
        var invoice = await this.state.invoices[index]._id

        var url = `/omega/invoice-details?id=${invoice._id}`
        this.props.history.push(url)
    
    }


    render(){
        return(
        <div className="container card card-body mt-3">
            <h1>Invoice Panel</h1>

            <div className="row">
                        <div className="col" >
                            <label class="m-1">From Date</label>
                            <DatePicker className="form-control"
                                selected={this.state.fromDate}
                                onChange={date => this.updateDate(date, true)}
                                />  
                        </div>
                        <div className="col " >
                            <label class="m-1">To Date</label>
                            <DatePicker className="form-control"
                                selected={this.state.toDate}
                                onChange={date => this.updateDate(date, false)}
                                />  
                        </div>
                    </div>
            <div>
                <button className='btn btn-primary m-2 mb-3' onClick={(e)=>{this.checkForPreInvoiceIssues(e)}}>Check for issues</button>
                <a className='btn btn-danger m-2 mb-3' href={'/omega/preview-invoice'}>Preview Invoice Data</a>
                <button className='btn btn-primary m-2 mb-3' onClick={this.createPreInvoices}>Create Invoices</button>      
                <h6>Invoice Type <span class="badge badge-secondary">{Object.keys(InvoiceType)[this.state.invoiceType]}</span></h6>       
            </div>
           

            {
                    this.state.formSubmitted?
                        <div class="alert alert-success" role="alert">
                       changes saved
                    </div>
                    :null
            }

            {
                    this.state.invoicesSent?
                        <div class="alert alert-danger" role="alert">
                       invoices sent
                    </div>
                    :null
            }
            {
                    this.state.fetchingInvoices?
                        <div class="alert alert-warning" role="alert">
                       invoices refreshed
                    </div>
                    :null
            }



            <div className="col">
            <div className="row mb-3">
                    <label  class="sr-only">Month</label>    
                    <select class="form-control"  onChange={e => this.setState({month:e.target.value})}>
                        <option  value={-1}>none (Month)</option>
                        {Months.map((month,index)=>(
                            <option selected={this.state.month == (index+1)} value={index+1} >{month}</option>
                        ))}
                     
                    </select>
                    </div>
                    <div className="row mb-3">
                        <label  class="sr-only">Year</label>
                        <select class="form-control"   onChange={e => this.setState({year:e.target.value})}>
                                <option value={-1}>none (year)</option>                            
                            <option selected={this.state.year == 2021} value="2021" >2021</option>
                            <option selected={this.state.year == 2022} value="2022" >2022</option>
                            <option selected={this.state.year == 2023} value="2023" >2023</option>
                            <option selected={this.state.year == 2024} value="2024" >2024</option>
                        </select>
                    </div>  

                    {
                        this.state.parents != null?
                     <div className="row mb-3">
                         <label  class="sr-only">Parents</label>
                         <select class="form-control"  onChange={e => this.chooseParent(e.target.value)}>
                         <option value={null}>none (parent)</option> 
                         {
                            this.state.parents.map((parent, index)=>
                            (
                                <option value={index}>{parent.firstName}</option>                                
                            ))
                         }  
                             
                         </select>
                     </div>   :null
                    }  

                    {
                        this.state.students != null?
                     <div className="row mb-3">
                         <label  class="sr-only">Parents</label>
                         <select class="form-control"  onChange={e => this.chooseStudent(e.target.value)}> 
                         <option value={null}>none (student)</option>
                         {
                            
                            this.state.students.map((student, index)=>
                            (
                                <option value={index}>{student.firstName}</option>                                
                            ))
                         }  
                             
                         </select>
                     </div>   :null
                    }  

                 
            </div>
         
            
            <div className="row">
                
                <div className="col mb-3">
                    <button className="btn btn-primary" onClick={this.getInvoices}>Get Invoices</button>

                </div>
                {
                    this.state.invoices?.length > 0? 
                    <div>
                        <button className='btn btn-warning m-2' disabled={this.state.formSubmitted || this.state.invoicesSent || this.state.fetchingInvoices} onClick={this.sendInvoices}>Send Invoices</button>
                    </div>
                    : null
                }
                
                <div className="col mb-3">
                    <button className="btn btn-primary" onClick={this.saveChanges}>Save Changes</button>

                </div>

            </div>

            {this.state.invoices?
            <div className="btn-group mb-5" role="group" aria-label="Basic checkbox toggle button group">
                    
            <button class="btn btn-primary" onClick={(e)=>this.filterInvoices(3)} for="btncheck3">All</button>
          
            
            <button class="btn btn-primary" onClick={(e)=>this.filterInvoices(0)} for="btncheck3">Paid Exact</button>

            <button class="btn btn-primary" onClick={(e)=>this.filterInvoices(1)} for="btncheck3">Paid Less</button>

            <button class="btn btn-primary" onClick={(e)=>this.filterInvoices(2)} for="btncheck3">Paid More</button>


           
          
          </div>     
 
            
            :null}

            { <input type="text" class="form-control mb-3" placeholder="name..." onChange={this.filter}/>}

            {
                this.state.justSent.length > 0?
                    <div>
                        {this.state.justSent.map((parent, index)=>{
                            <div>
                                {parent.firstName}
                            </div>    
                        })}
                    </div>    
                :null
            }
            

            {
                this.state.invoices?

                    this.state.invoices.length > 0 ? 

              <div className='mb-3 mt-3'>              
                    
                <div className="card card-body" style={{background: 'rgb(204, 204, 255)' }}>                

                                <div class="row">
                                        <div className="col">
                                            stripe id
                                        </div>
                                        <div className='col'>
                                            url
                                        </div>        
                                        <div className="col">
                                            Month/Year
                                        </div>                                  
                                        <div className="col">
                                            Parent
                                        </div> 
                                        <div className="col">
                                            Sent
                                        </div>                             
                                        <div className="col">
                                            Paid
                                        </div>
                                        <div className="col">
                                            Invoice Type
                                        </div> 
                                        <div className='col'>
                                            Invoice status
                                        </div>  
                                        <div className='col'>
                                            Re-invoice
                                        </div>

                                        <div className='col'>
                                            Details
                                        </div>                                 
                                      
                                             
                                    </div> 
                            {
                                this.state.invoices.map((invoice,index)=>(
                                    
                                    <div class={"row mb-1 "+(invoice.invoiceStatus == "deleted" || invoice.invoiceStatus == "void"? "row-disabled":"")}>
                                        <div className="col text-id">                                          
                                            {invoice.stripeInvoiceId}                                          
                                        </div>
                                        <div className='col'>
                                            <a href={invoice.invoiceUrl} >invoice</a>
                                        </div>    
                                        <div className="col">
                                            {invoice.month + "/" + invoice.year}
                                        </div> 
                                      
                                        <div className="col">
                                            {invoice.parent.firstName + ' ' + invoice.parent.lastName}
                                        </div>  

                                        <div className="col">
                                            {invoice.invoiceUrl != null?<FontAwesomeIcon icon={faCheck}/>:<FontAwesomeIcon icon={faTimesCircle} color="red"  size="lg" />}
                                        </div>  
                                        
                                        <div className="col">
                                            {invoice.isInvoicePaid?<FontAwesomeIcon icon={faCheck}/>:<FontAwesomeIcon icon={faTimesCircle} color="red"  size="lg" />}
                                        </div>  
                                        <div className='col'>
                                            {invoice.incoiceType? "type" : "no type"}
                                        </div>
                                        <div className='col'>
                                            {invoice.invoiceStatus}
                                        </div>
                                        <div className='col'>
                                            <button className='btn btn-danger' onClick={e=>this.toggleReInvoiceModal(index)}>Re-Invoice</button>
                                        </div>  
                                        <div className='col'>
                                            <a className='btn btn-danger' target={'_blank'} href={'/omega/invoice-details?id='+invoice._id}>details</a>
                                        </div>                             
                                    

                                    </div>    
                                ))
                            }

                        </div>    
                        </div>   

                    :

                        <div className="mb-5">
                            No Invoices Found in this range
                        </div>    

                
                :null
            }

            {
                this.state.modalIvoice?
                    <Modal isOpen={this.state.showPaymentModal} toggle={e=>this.toggleShowPaymentModal(null,null)} >
                        <ModalHeader >Custom Payment</ModalHeader>
                        <ModalBody>
                            <div className="col">
                                <div className="row">
                                    <div className="col">
                                        {this.state.modalIvoice.parent.firstName}
                                     
                                            <div class="form-check">
                                            <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="option2" onChange={e=>this.setState({modalPaidStatus:1})} />
                                            <label class="form-check-label" for="exampleRadios2">
                                                Paid Less
                                            </label>
                                            </div>
                                            <div class="form-check">
                                            <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="option3" onChange={e=>this.setState({modalPaidStatus:2})}/>
                                            <label class="form-check-label" for="exampleRadios2">
                                                Paid More
                                            </label>
                                            </div>


                                            {this.state.modalPaidStatus?
                                                this.state.modalPaidStatus != 0?
                                                <div className="row mb-3">
                                                <label  class="form">Payment amount</label>    
                                                <input class="form-control" required  type="number" step=".01" min="0" onChange={this.setModalPaymentAmount}/>
                                                   
                                                
                                                </div>   
                                                :null                                               

                                            :null}

                                    </div>

                                </div>

                            </div>
                           
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={this.confirmPayment} >Confirm</Button>{' '}
                            <Button color="secondary" onClick={e=>this.toggleShowPaymentModal(null,null)}>Cancel</Button>
                        </ModalFooter>
                    </Modal>:null
            }


            {
                
                    <Modal isOpen={this.state.showReInvoiceModal} toggle={this.toggleReInvoiceModal} >
                        <ModalHeader >are you sure you want to Re-Invoice?</ModalHeader>
                        <ModalBody>
                            <p>A new invoice will be issued</p>
                            <p>the old invoiced will be drafted</p>
                            <p>do not re-invoice if the client has paid for the invoice</p>
                            <p>Parent: {this.state.chosenReInvoice?.parent.firstName + " " + this.state.chosenReInvoice?.parent.lastName  }</p>
                            <p>From Date</p>
                            <p>Dates will be inclusive</p>
                            <DatePicker className="form-control"
                                selected={this.state.reInvoiceFromDate}
                                onChange={date => this.setState({reInvoiceFromDate: date})}
                                /> 
                            <p>To Date</p>
                            <DatePicker className="form-control"
                                selected={this.state.reInvoiceToDate}
                                onChange={date => this.setState({reInvoiceToDate: date})}
                                /> 
                            <p>An invoice will be generated for the taken lessons of the dates you enter</p>
                            <button class="btn btn-primary" onClick={this.previewReinvoice}>Preview Re-invoice</button>

                            {
                                this.state.previewReinvoiceData != null?
                                (
                                    <div>
                                    <p>
                                        {this.state.previewReinvoiceData.fullName}
                                    </p>

                                    {
                                        this.state.previewReinvoiceData?.studentsLessons?.forEach((lessonGroup,index)=>
                                        {
                                            <div>yo</div>
                                        })
                                    }
                                    
                                    {this.state.previewReinvoiceData?.studentsLessons?.map((lessonGroup,index)=>
                                    (   
                                        <div key={index}>
                                            
                                            <p>{lessonGroup?.student?.firstName + " "+ lessonGroup?.student?.lastName}</p>
                                             {
                                                lessonGroup?.lessons.map((lesson, index)=>
                                                (
                                                    <p>{lesson?.subject + " " + lesson?.price + " "+ lesson?.hours + " "}</p>

                                                ))
                                            }
                                            <hr/>
                                        </div>
                                        
                                    ))}
                                    </div>                                    
                                )
                                :null
                            }
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={this.createNewPreInvoice} >Confirm</Button>{' '}
                            <Button color="secondary" onClick={this.toggleReInvoiceModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
            }

        </div>)
    }


}

export default PreInvoicePaymentPanel