import {Component} from 'react'
import axios from 'axios'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import qs from 'qs'
import { saveAs } from 'file-saver';
import Months from '../../Enums/Months'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload,faTimesCircle } from '@fortawesome/free-solid-svg-icons'
function saveByteArray(reportName, byte) {
    
    var blob = new Blob([byte], {type: "application/pdf"});
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
};
class PreInvoicePaymentPanel extends Component {

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
            <h1>Pre Payement Panel</h1>

            <p>Invoices are retrieved using the filters</p>
            <p>Any over or underpayed invoices will also be retrieved</p>
            <p>Only shows created invoices</p>

            {
                    this.state.formSubmitted?
                        <div class="alert alert-success" role="alert">
                        congrats lessons have been created
                    </div>
                    :null
            }

            <div className="col">
            <div className="row mb-3">
                    <label  class="sr-only">Month</label>    
                    <select class="form-control" defaultValue={this.state.month} onChange={e => this.setState({month:e.target.value})}>
                        <option value="0">Month</option>
                        {Months.map((month,index)=>(
                            <option selected={this.state.month == (index+1)} value={index+1} >{month}</option>
                        ))}
                     
                    </select>
                    </div>
                    <div className="row mb-3">
                        <label  class="sr-only">Year</label>
                        <select class="form-control"  onChange={e => this.setState({year:e.target.value})}>
                            <option value="0">year</option>

                            
                            <option selected={this.state.year == 2021} value="2021" >2021</option>
                            <option selected={this.state.year == 2022} value="2022" >2022</option>
                            <option selected={this.state.year == 2023} value="2023" >2023</option>
                            <option selected={this.state.year == 2024} value="2024" >2024</option>
                        </select>
                    </div>

                
                    
                      
                     
                 
            </div>
            <div>
              
                    
                    <div className="row mb-3">
                        <label  class="sr-only">Parents</label>
                        <select class="form-control"  onChange={e => this.setState({chosenParents: [...this.state.chosenParents,e.target.value]})}>
                            <option>parents</option>
                            {this.state.parents?.map((parent,index)=>(
                                <option value={parent._id}>{parent.firstName + ' ' + parent.lastName}</option>
                            ))}
                        </select>
                    </div>

                
            </div>

            <div>
        
                    
                    <div className="row mb-3">
                        <label  class="sr-only">Students</label>
                        <select class="form-control"  onChange={e => this.setState({chosenStudents: [...this.state.chosenStudents,e.target.value]})}>
                            <option>students</option>
                            {this.state.students?.map((student,index)=>(
                                <option value={student.parent._id}>{student.firstName + ' ' + student.lastName}</option>
                            ))}
                        </select>
                    </div>
                    
            
            </div>

            
            <div className="row">
                
                <div className="col mb-3">
                    <button className="btn btn-primary" onClick={this.getInvoices}>Get Invoices</button>

                </div>
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
            

            {
                this.state.invoices?

                    this.state.invoices.length > 0 ? 

                <div className="card card-body" style={{background: 'rgb(204, 204, 255)' }}>                

                                <div class="row">
                                        <div className="col">
                                            Download
                                        </div>    
                                        <div className="col">
                                            Month
                                        </div> 
                                        <div className="col">
                                            Year
                                        </div>  
                                        <div className="col">
                                            Parent
                                        </div>  
                                        <div className="col">
                                            total
                                        </div>
                                        <div className="col">
                                            post total
                                        </div>
                                        <div>
                                            update balance
                                        </div>    
                                        <div className="col">
                                            created
                                        </div>
                                        <div className="col">
                                            sent
                                        </div>
                                        <div className="col">
                                            Paid Exact
                                        </div>  
                                        <div className="col">
                                            Custom Payement
                                        </div>
                                        <div className="col">
                                            Payment Recorded
                                        </div>       
                                    </div> 
                            {
                                this.state.invoices.map((invoice,index)=>(
                                    <div class="row mb-1">
                                        <div className="col">
                                            <button className="btn btn-danger" disabled={invoice.created == 0} onClick={e=>this.download(invoice)} ><FontAwesomeIcon icon={faDownload} color="green"  size="lg" /> </button>
                                        </div>    
                                        <div className="col">
                                            {invoice.month}
                                        </div> 
                                        <div className="col">
                                            {invoice.year}
                                        </div>  
                                        <div className="col">
                                            {invoice.parent.firstName + ' '}
                                        </div>  
                                        <div className="col">
                                            {invoice.total}
                                        </div>
                                        <div className="col">
                                            {invoice.postInvoice[0]? invoice.postInvoice[0].total : 0}
                                        </div>
                                        <div className="col">
                                            <a href={"/admin/parent-records?id="+invoice.parent}>{invoice.total - (invoice.postInvoice[0]? invoice.postInvoice[0].total : 0)}</a>
                                        </div>
                                        <div className="col">
                                            {invoice.created}
                                        </div>
                                        <div className="col">
                                            {invoice.sent?invoice.sent:<FontAwesomeIcon icon={faTimesCircle} color="red"  size="lg" />}
                                        </div>
                                        <div className="col">
                                            <button className="btn btn-primary" onClick={e=>this.paidExact(index)}>{"paid £"+invoice.total}</button>
                                        </div>
                                        <div className="col">
                                            <button className="btn btn-warning" onClick={e=>this.toggleShowPaymentModal(index,invoice)} >Custom payment</button>
                                        </div>
                                        <div className="col">
                                            {
                                                invoice.paymentAmount
                                            }
                                        </div>

                                    </div>    
                                ))
                            }

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

        </div>)
    }


}

export default PreInvoicePaymentPanel