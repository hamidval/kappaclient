import react,{Component} from 'react'
import { Button, Modal, ModalHeader } from 'reactstrap';
import DatePicker from "react-datepicker";
import Subjects from '../../Enums/Subjects'
import EditTakenLessonForm from './EditTakenLessonForm'
import AddTakenLessonForm from './AddTakenLessonForm'
import axios from 'axios'
import qs from 'qs'
import EditStudentTakenLessonsRow from "./EditStudentTakenLessonRow";
import jsPDF from 'jspdf'
import CsvDownload from 'react-json-to-csv'
import BaseComponent from '../../BaseComponent';

class EditStudentTakenLessons extends BaseComponent{

    constructor(props){
        super(props)
        this.state = {
            takenLessons:null,
            takenLessonsCopy:null,
            student:null,
            teacher:null,
            fromDate:null,
            toDate:null,
            subject:null,
            allStudents:null,
            filteredStudents:null,
            allTeachers:null,
            allSubjects:null,
            showStudentList:'none',
            studentSearchTerm:'',
            searched:false,
            showModal:false,
            showAddModal:false,
            chosenLesson:null,
            showRefundModal: false,
            refundTakenLessonId: null,    
            refundTakenLesson: null,   
            errorTimer:5000,   
            options :{ authorization: this.props.token,userid:this.props.userId } 
        }
    }

    componentDidMount = async ()=>{
        var queryString = qs.parse(window.location.search, { ignoreQueryPrefix: true })
        var sid = queryString.id? queryString.id : null

        if(sid != null){
           
            await   this.getStudent(sid)

           
          // await this.select()
        }
        await  this.getAllStudents();
        await  this.getAllTeachers();
    }

    getStudent = async (sid) =>{
        await axios.get('/api/students/sid?id='+sid,{headers:this.state.options})
        .then(async response => {
             var student = await response.data[0];
             await this.setState({student:student})

             await console.log(this.state.student,"yoooo")
         
        });
    }
    getAllStudents = async  () => {
        var options =  { authorization: 'Bearer '+this.props.token,
            userId:this.props.userId }
        await axios.get('/api/students/all',{ headers:options })
        .then(async response => {
             var students = await response.data;
             console.log(students);
             this.setState({allStudents:students})
             this.setState({filteredStudents:students})
         
        });
    }

    getAllTeachers = async  () => {
        var options =  { authorization: this.props.token,
            userId:this.props.userId }
        await axios.get('/api/teachers/all',{ headers:options })
        .then(async response => {
             var students = await response.data;
             console.log(students);
             this.setState({allTeachers:students})
         
        });
    }

    toggleRefundModal = async (id)=>
    {
        this.setState({refundTakenLessonId: id})
        var options =  { authorization: this.props.token,
            userId:this.props.userId }
        await axios.get('/api/taken-lessons/id/'+id,{ headers:options })
        .then(async response => {
             var takenLesson = await response.data;
             this.setState({refundTakenLesson:takenLesson})
         
        });
        this.setState({showRefundModal: !this.state.showRefundModal})
    }

    refundTakenLesson = async (id) =>
    {
        var options =  { authorization: this.props.token,
            userId:this.props.userId }
        await axios.post('/api/taken-lessons/refund/'+id,{ headers:options })
        .catch((err)=>
            {             
              this.setState({error:err})
              this.setErrorTimeout()
            })
       
        this.setState({showRefundModal: !this.state.showRefundModal})
        alert("refund processed")
    }

    showStudentList = () =>{
        this.setState({showStudentList:'block'})
    }

    hideStudentList = () =>{
        this.setState({showStudentList:'none'})
    }

    filterStudents = (searchTerm) => {
        var allStudents  = this.state.allStudents;
        var filteredStudents = allStudents.filter((item)=>item.firstName.toLowerCase().includes(searchTerm.toLowerCase()) 
        || item.lastName.toLowerCase().includes(searchTerm.toLowerCase()));

        this.setState({filteredStudents:filteredStudents})



    }

    setStudentSearch = (e)=>{
        this.setState({student:null})
        this.setState({studentSearchTerm:e.target.value})
  
        this.filterStudents(e.target.value);
        if(e.target.value.length >0){
            this.showStudentList();
        }else{
            this.hideStudentList();
        }

    }
    setStudent = (i)=>{
        var index = i;
        var student = this.state.filteredStudents[index];
        this.setState({student:student})
       
        this.hideStudentList();
    }

    setSubject=(e)=>{
        this.setState({subject:e.target.value})
    }

    setTeacher=(e)=>{
        this.setState({teacher:e.target.value})
      
    }

    startSearch=(e)=>{
     
        this.setState({searched:true})
        var subject = this.state.subject? this.state.subject:null
        var sid = this.state.student? this.state.student._id:null
        var toDate = this.state.toDate? this.state.toDate:null
        var fromDate = this.state.fromDate? this.state.fromDate:null
        var teacher = this.state.teacher? this.state.teacher:null

                
                this.queryTakenLessons(subject, sid , toDate, fromDate, teacher)

    }

    queryTakenLessons = async (subject,sid,toDate,fromDate,tid) =>{
        var options =  { authorization: this.props.token,
            userId:this.props.userId }
        await axios.get('/api/taken-lessons/query?'+
        (sid?"&sid="+sid:"")+
        (subject?"&subject="+subject:"")+
        (toDate?"&to="+toDate:"")+
        (fromDate?"&from="+fromDate:"")+
        (tid?"&tid="+tid:""),
        { headers:options })
        .then(async response => {
            
             var lessons = await response.data;
       
             this.setState({takenLessons:lessons})
             this.setState({takenLessonsCopy:lessons})
             
         
        });

    }

    toggleModal = (e,index) =>{
        this.setChosenLesson(index)
        this.setState({showModal:!this.state.showModal})

    }

    downloadCSV = () =>{

    }

    toggleAddModal = (e) =>{
      
        if(this.state.student != null){
            this.setState({showAddModal:!this.state.showAddModal})
        }else{
            alert('must choose student')
        }
        

    }

    setChosenLesson = (index) =>{

        var lesson = this.state.takenLessons[index]
        this.setState({chosenLesson:lesson})

    }

    download = async () =>{
        var doc = new jsPDF('p', 'pt', 'a2');     
        doc.setFontSize(10);   
       
        var source = await window.document.getElementById("takenLessonTable")
        await doc.html(
            source
            );


           await doc.output("dataurlnewwindow");

    }

    render(){
        return(
            <div>
                <h1>
                    Modify Taken Lessons
                </h1>

                {
                    this.state.error != null?
                        <div class="alert alert-danger" role="alert">
                        {this.state.error.response.status +" : "+ this.state.error.response.statusText}
                    </div>
                    :null
                }
               
                <form className="container">
                    <div class="form-row">
                        <div class="form-group col-md-12">
                        <label for="inputEmail4">Student</label><br/>
                        {
                            this.state.allStudents?.length>0?
                            <input value={this.state.student?this.state.student.firstName +" "+ this.state.student.lastName:null} class="form-control" onChange={this.setStudentSearch} placeholder="search for students ..."/>:
                            <div className="btn btn-warning"><strong>Loading..</strong></div>
                        }                        
                        <div className="col" style={{cursor:'pointer'}}
                         size={this.state.filteredStudents?.length} onChange={this.setStudent}  style={{display:this.state.showStudentList}}>
                            
                            {this.state.filteredStudents != null?this.state.filteredStudents.map((item,index)=>(
                               <EditStudentTakenLessonsRow
                                item={item}
                                index={index}
                                setStudent = {this.setStudent}
                               />

                            )):null}
                        </div>
                        
            
                        </div>
                        <div class="form-group col-md-12">
                        <label for="inputPassword4">Teacher</label>
                        <select class="form-control" id="exampleFormControlSelect1" onChange={this.setTeacher} >
                                        <option></option>
                                            {this.state.allTeachers?
                                                this.state.allTeachers.map((item,index)=>(
                                                    <option value={item._id}>{item.fullName}</option>
                                                ))
                                            :
                                            <option>error</option>
                                            }
                                        </select>
                        </div>
                    </div>
                    <div className="form-row">
                    <div class="form-group col-md-6">
                        <div className="row-md">
                            <label for="inputAddress">From (Inclusive)</label>
                        </div> 
                        <DatePicker className="form-control"
                        selected={this.state.fromDate}
                        onChange={date => this.setState({fromDate:date})}
                        /> 
                    </div>
                    <div class="form-group col-md-6">
                        <div className="row-md">
                            <label for="inputAddress">To (Inclusive)</label>
                        </div> 
                        <DatePicker className="form-control"
                        selected={this.state.toDate}
                        onChange={date => this.setState({toDate:date})}
                        /> 
                    </div>
                    </div>
                    <div class="form-group col-md-12">
                        <label for="inputPassword4">Subject</label>
                        <select class="form-control" id="exampleFormControlSelect1" onChange={this.setSubject}>
                                        <option></option>
                                            {Subjects?
                                                Subjects.map((item,index)=>(
                                                    <option>{item}</option>
                                                ))
                                            :
                                            <option>error</option>
                                            }
                        </select>
                    </div>
                    
                 
                    
                    </form>

                    {
                        this.state.searched?
                        
                        <button 
                        onClick={(e)=>this.setState({searched:false})}
                        class="btn btn-danger">back
                        </button>


                        :
                        <button 
                            onClick={this.startSearch}
                            class="btn btn-primary">Start Search
                        </button>




                    }

                    {

                        <div>
                            <button className="btn btn-warning m-1"
                                onClick={this.toggleAddModal}
                            >Add New Taken Lesson</button>
                        </div>    
                    }

                    {this.state.takenLessons?.length >0?
                        <div>
                            <button onClick={this.download} className="btn btn-success">
                                Download
                            </button>
                            <CsvDownload data={this.state.takenLessons} />
                        </div>    
                    :null}

                    {this.state.takenLessons?
                        this.state.takenLessons.length < 1?
                        <div>
                            No Lessons Found!
                        </div>    
                        :
                        <div id="takenLessonTable" className="container table table-dark">
                            
                            <div className="row pd-2">
                                <div className="col">Date</div>
                                <div className="col">Day</div>
                                <div className="col">Crction</div>
                                <div className="col">Subject</div>
                                <div className="col">Teacher</div>
                                <div className="col">Student</div>
                                <div className="col">Rate</div>
                                <div className="col">PPL</div>
                                <div className="col">Hrs</div>
                       
                                <div className="col">FPL</div>

                            </div>
                    
                        {this.state.takenLessons.map((item,index)=>(
                            <div className="row table-row" >
                                <div className="col">{item.date.toString().slice(0,10)}</div>
                                <div className="col">{item.day}</div>
                                <div className="col">{item.correction}</div>
                                <div className="col">{item.subject}</div>
                                <div className="col">{item.teacher.fullName}</div>
                                <div className="col">{item.student.firstName}</div>
                                <div className="col" >{item.rate}</div>
                                <div className="col">{item.payPerLesson}</div>
                                <div className="col">{item.hours}</div>                             
                                <div className="col">{item.feePerLesson}</div>
                                <div className="col">{item.stripeRefundId? "refunded": null}</div>
                                <div><button className='btn btn-danger' onClick={()=>{this.toggleRefundModal(item._id)}}>refund</button></div>
                                <div><button className='btn btn-warning' onClick={(e)=>{this.toggleModal(e, index)}}>edit</button></div>
                            </div>


                        ))}

                        </div>
                    :null}
                    
            <Modal isOpen={this.state.showModal} toggle={this.toggleModal} >
                <ModalHeader >You are about to Edit a taken lesson</ModalHeader>
                {this.state.chosenLesson?

                <EditTakenLessonForm
                    chosenLesson={this.state.chosenLesson}
                    teachers={this.state.allTeachers}
                    students={this.state.allStudents}
                    userId={this.props.userId}
                    token={this.props.token}
                    toggleModal={this.toggleModal}
                />
                
                
                :null}            
            </Modal>


            <Modal isOpen={this.state.showAddModal} toggle={this.toggleAddModal} >
                <ModalHeader >You are about to Add a taken lesson</ModalHeader>
           

                <AddTakenLessonForm
                teachers={this.state.allTeachers}
                students={this.state.allStudents}
                userId={this.props.userId}
                token={this.props.token}
                toggleAddModal={this.toggleAddModal}
                chosenStudent={this.state.student}
                />
                
                
                         
            </Modal>


            <Modal isOpen={this.state.showRefundModal} toggle={this.toggleRefundModal} >
                <ModalHeader >Place Refund</ModalHeader>
                <div className='m-2 p-1'>
                    <div>
                        ID: {this.state.refundTakenLesson?._id}
                    </div>
                    <div>
                        Fee: {this.state.refundTakenLesson?.feePerLesson}
                    </div>

                    <div>
                        <button 
                            className='btn btn-primary' 
                            onClick={()=>this.refundTakenLesson(this.state.refundTakenLesson?._id)}>
                                Submit Refund
                        </button>
                    </div>
                </div>
    
                         
            </Modal>


              


            </div>

            

        )
    }
}

export default EditStudentTakenLessons
