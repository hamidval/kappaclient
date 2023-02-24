import {Component} from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axios from 'axios'
import AddLessonForm from './AddLessonForm'
import qs from 'qs'
import BaseComponent from '../BaseComponent';
import Subjects from '../Enums/Subjects';
import LessonTypes from '../Enums/LessonType';
class EditStudentLessons extends BaseComponent{

    constructor(props){
        super(props)
        this.state = {students:null,
            filteredStudents:null,
            chosenStudent:null,
            chosenStudentIndex:null,
            chosenStudentLessons:[],
            chosenStudentLessonsToAdd:[],
            chosenStudenLessonsToRemove:[],
            chosenSubject:null,
            chosenLessonType:null,
            selected:false,
            disableSearch:false,
            showAddLessonModal:false,
            showSaveModal:false,  
            copyLesson:null,  
            teachers:null,        
            options :{ authorization: this.props.token,userid:this.props.userId }          
          
        }

    }

    componentDidMount = async () =>{
        await this.getAllTeachers();
        var queryString = qs.parse(window.location.search, { ignoreQueryPrefix: true })
        var sid = queryString.id? queryString.id : null

        if(sid != null){
           
            await   this.getStudent(sid)

           
           await this.select()
        }
      await  this.getAllStudents();

       
    

    }

    getAllTeachers = async  () => {
                 
        await axios.get('/api/teacher')
        .then(async response => {
             var teachers = await response.data;
             console.log(teachers)
             this.setState({teachers:teachers})
           
         
        });
    }

    getStudent = async (sid) =>{
        await axios.get('/api/student/'+sid)
        .then(async response => {
             var student = await response.data[0];
             this.setState({chosenStudent:student})

             console.log(this.state.chosenStudent)
         
        });
    }

    copyLesson = (id)=>{
        var lessons  = this.state.chosenStudentLessons.filter((a)=>a._id === id);


        this.setState({copyLesson:lessons[0]});
        console.log(lessons[0])
        this.toggleAddLessonModal()
    }



    getAllStudents = async  () => {
                 
        await axios.get('/api/student',{headers:this.state.options})
        .then(async response => {
             var students = await response.data;
             console.log(students);
             this.setState({students:students})
             this.setState({filteredStudents:students})
         
        });
    }

    filter = (e) =>{
        this.setState({selected:false})
        var allStudents = this.state.students;
        var value = e.target.value.toString().toLowerCase();
        var filteredStudents = allStudents.filter((a)=>
         a.firstName.toString().toLowerCase().includes(value) ||
         a._id.toString().toLowerCase().includes(value) ||
         a.lastName.toString().toLowerCase().includes(value)
        )

        this.setState({filteredStudents:filteredStudents})
  
    }

    selectRow = (index)=>{
        var chosenStudent = this.state.filteredStudents[index]
        this.setState({chosenStudentIndex:index})
        this.setState({chosenStudent:chosenStudent})
        this.setState({selected:false})
        
    }
 select = async (e)=>{
    console.log(this.state.chosenStudent)
        if(this.state.chosenStudent !=null){
            if(!this.state.selected){
            
            this.setState({selected:true})
            await axios.get('/api/lesson/student/'+this.state.chosenStudent._id)
                .then(async response =>{
                        var data = response.data;
                        console.log(data)
                        this.setState({chosenStudentLessons:data})
                })
            }else{
                alert('already selected')  
            }
        }else{
            alert('no student selected')
        }
    }

    refreshLesson = async () =>{
        await this.setState({chosenStudentLessons:[]})
        await axios.get('/api/lesson/student/'+this.state.chosenStudent._id)
        .then(async response =>{
                var data = await response.data;
                await this.setState({chosenStudentLessons:data})
                await this.setState({chosenStudentLessonsToAdd:[]})
        })
    }

    setDate = async (date) =>{
        await this.setState({dayOfWeek:date.getDay()})
        await this.setState({chosenDate:date})
      
    }

    back = (e)=>{
        this.setState({selected:false})
        this.setState({chosenStudentLessonsToAdd:[]})
    }
    
    addLesson = async  (e) =>{
        this.setState({copyLesson: null})
        this.toggleAddLessonModal(e)
    }

    toggleAddLessonModal = (e) =>{
        this.setState({showAddLessonModal:!this.state.showAddLessonModal})

    }
    toggleSaveModal = (e) =>{
        this.setState({showSaveModal:!this.state.showSaveModal})
    }
    saveChanges = async (e)=>{
        
        if(this.state.chosenStudentLessonsToAdd?.length === 0 && this.state.chosenStudenLessonsToRemove?.length == 0){
            alert('no changes')
        }
       
        if(this.state.chosenStudentLessonsToAdd.length>0){
            await this.state.chosenStudentLessonsToAdd.map(async (lesson,index)=>{

                var response = await this.sendApiRequest('/api/lessons', {lesson:lesson,headers:this.state.options})
                                
            })
        }
         
        if(this.state.chosenStudenLessonsToRemove.length >0){
            await this.state.chosenStudenLessonsToRemove.map(async (id,index)=>{
                
         



                var lessonApiStr = await '/api/lessons/delete?id='+id.toString()
     
                 await axios.delete(lessonApiStr,{headers:this.state.options})
                .then(response => {
                     this.refreshLesson()
                 
              });
            })

        }

            
   

        this.toggleSaveModal();
        await this.refreshLesson()
       
        

    }
    removeExistingLesson = async (e,index) =>{
      
        if (index > -1) {

            var lessons = await this.state.chosenStudentLessons
            var lesson = await lessons[index]
            if(lesson.remove){
                lesson.remove = await false
            }else{
              
                lesson.remove = await true
            }      
               
            var lessonsToRemove = await this.state.chosenStudenLessonsToRemove
            await lessonsToRemove.push(lesson._id)
            await this.setState({chosenStudenLessonsToRemove:lessonsToRemove});
        
            await this.setState({chosenStudentLessons:lessons})
          }

         await console.log(this.state.chosenStudentLessons)

    }
    removeAddedLesson = (e,index) =>{
                
        if (index > -1) {
            var lessons = this.state.chosenStudentLessonsToAdd;
           lessons.splice(index,1);
           
         
            this.setState({chosenStudentLessonsToAdd:lessons})
          }

    }

    resetCopyLesson = (e) =>{
        this.setState({copyLesson: null})
    }
    render(){
        return(
            <div id="EditLessons" className="container ">
                <div >
                   <h1 className="mt-2">Edit Student Lessons</h1>
                </div>
                {
                    this.state.filteredStudents?

                    <div class="form-group m-3">
                    <label >Student Name / ID</label>
                    <input disabled={this.state.selected} class="form-control"
                        placeholder={this.state.chosenStudent?this.state.chosenStudent.firstName.toString():"Enter student name / id"}
                        onChange = {this.filter}
                        
                        ></input>
                    </div>
                    
                    :null
                }

                {
                    this.state.filteredStudents?

                    <div className="row m-3 ">
                    {this.state.selected?
                     <div className="col">
                        <button className="btn btn-danger m-1" onClick={this.back}>Back</button>
                     </div>
                    :
                    <div className="col">
                    <button className="btn btn-success m-1" onClick={this.select}>Select</button>
                </div>
                    }              
      
                    </div>
                    
                    :null
                }
                
                <div>
                    <table className="table table-hover table-dark rounded">
                        <tbody>
                    {this.state.filteredStudents?
                        !this.state.selected?
                        this.state.filteredStudents.map((item,index)=>(
                            <tr style={this.state.chosenStudentIndex === index? {background:'orangered'} :null} className="clickable-row table-row" onClick={()=>{this.selectRow(index)}}>
                                <td>{item.firstName}</td>
                                <td>{item.lastName}</td>
                                <td>{item._id}</td>
                            </tr>

                        )):
                   
                            <tr style={{background:'orangered'}} className="clickable-row table-row">
                                <td>{this.state.chosenStudent.firstName}</td>
                                <td>{this.state.chosenStudent.lastName}</td>
                                <td>{this.state.chosenStudent._id}</td>
                            </tr>

               

                    :null}
                    </tbody>
                    </table>

                            
                </div>
               
               
            {
                this.state.selected?
                <div>
                    <h3 class="title m-3">Lessons For Selected Student</h3>
                    <div class="m-3">
                        <button className="btn btn-success m-1" onClick={this.addLesson} >Add Lesson</button>
                        <button className="btn btn-primary m-1" onClick={this.toggleSaveModal}>Save Changes</button>
                    </div>
                    {this.state.chosenStudentLessons != null && this.state.chosenStudentLessons.length >0?
                        <div>
                            <table className="table table-responsive table-light rounded">
                                <thead>
                                    <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Subject</th>
                                    <th scope="col">Rate key</th>
                                    <th scope="col">Day</th>
                                    <th scope="col">SingleFee</th>
                                    <th scope="col">SinglePay</th>
                                    <th scope="col">Copy</th>
                                    <th scope="col">GroupFee</th>
                                    <th scope="col">GroupPay</th>
                                    <th scope="col">teacher</th>
                                    <th scope="col">Start date</th>
                                    <th scope="col">End date</th>
                                    <th scope="col">-</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    
                                    {this.state.chosenStudentLessons.length>0?
                                    
                                        this.state.chosenStudentLessons.map((item,index)=>(
                                            //style={item.remove == true? {background:'red'}:null, (item.isCoverLesson && item.endDate < new Date())?{background:'lightblue'}:null}
                                            <tr style={{background:item.remove?'red':new Date(item.endDate) < new Date()?'orange':'none'}} >
                                            <td>{item._id}</td>
                                            <td>{Subjects[item.subject]}</td>
                                            <td>{LessonTypes[item.lessonType]}</td>                                        
                                            <td>{item.day}</td>
                                            <td>{item.singleFee}</td>
                                            <td>{item.singlePay}</td>
                                            <td><button className="btn btn-warning" onClick={(e)=>this.copyLesson(item._id)} >Copy</button></td>
                                            <td>{item.groupFee}</td>
                                            <td>{item.groupPay}</td>
                                            <td>{item.teacher}</td>
                                            <td>{item.startDate}</td>
                                            <td>{item.endDate}</td>
                                            <td><button className="btn btn-danger"
                                                onClick={(e)=>this.removeExistingLesson(e,index)}
                                            >X</button></td>

                                        </tr>

                                    )):null}
                                  
                                </tbody>
                            </table>
                         </div>   
                
                    :null}               
                
                       

                </div>

              
                :null
            }

            <Modal isOpen={this.state.showAddLessonModal} toggle={this.toggleAddLessonModal} >
                <ModalHeader >Add Lesson</ModalHeader>
              
                    <AddLessonForm 
                        options={ this.state.options }
                        student={this.state.chosenStudent}
                        lessonsToAdd={this.state.chosenStudentLessonsToAdd}
                        showAddLessonModal={this.state.showAddLessonModal}
                        toggleAddLessonModal={this.toggleAddLessonModal}
                        copyLesson ={this.state.copyLesson}
                        resetCopyLesson = {this.resetCopyLesson}
                     />
           
             
            </Modal>

            <Modal isOpen={this.state.showSaveModal} toggle={this.toggleSaveModal} >
                <ModalHeader >You are about to Save your changes</ModalHeader>
              
                <ModalBody>    
                    <div>
                        please make sure you have reviewed and are happy with your changes
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this.saveChanges}>Save</Button>{' '}
                    <Button color="secondary" onClick={this.toggleSaveModal}>Cancel</Button>
                </ModalFooter>
             
            </Modal>
        
            </div>
        )
    }
}

export default EditStudentLessons
