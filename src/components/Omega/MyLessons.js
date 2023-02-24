import react,{Component} from 'react'
import DatePicker from "react-datepicker";
import axios from 'axios'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

Date.prototype.formatDDMMYYYY = function(){
    return (this.getDate() +"/"+ (this.getMonth() + 1) + 
    "/" +  this.getFullYear());
}
class MyLessons extends Component {

    constructor(props){
        super(props)
        this.state = {fromDate:null,
            toDate:null,
            takenLessons:null,
            isResults:false,
            subtotal:null,
            lessonToDelete:null,
            lessonToDeleteId:null,
            justSaved:false,
            minDate:null,
            maxDate:null,
            options :{ authorization: this.props.token,userid:this.props.userId }   
        }
    }

    componentDidMount = async () =>{
        await this.setMinMaxDates()
    }

    setMinMaxDates = async () =>{
        var date = new Date()        
        
        var maxMonth = date.getMonth()
        if(date.getDate() >= 27){ // 27 is cut off date
            maxMonth++;
        }
        var minMonth = maxMonth == 1? 12: maxMonth - 1

        var maxYear = date.getFullYear();
        var minYear = maxMonth == 1? maxYear -1 : maxYear

        await this.setState({maxDate:new Date(maxYear,maxMonth,25)})
        await this.setState({minDate:new Date(minYear,minMonth,26)})

        await console.log(this.state.minDate,this.state.maxDate)
        
       
        
      
    }

    getLessons = async () =>{
        console.log(this.props.id)
        await  axios.get('/api/taken-lessons/teacher/fromtodate?tid='+this.props.id+
            '&fromDate='+this.state.fromDate+'&toDate='+this.state.toDate,
            {headers:this.state.options})
        .then(response=>{
            this.setState({takenLessons:response.data})
            this.calculateSubtotal(response.data);
            this.setState({isResults:true})

        })
    }

    search = (e) =>{
        if(this.state.fromDate != null && this.state.toDate != null){
            if(this.state.fromDate<this.state.toDate){
                this.getLessons()
            }else{
                alert('cannot query between these dates');
            }
        }else{
            alert('enter dates')
        }
    }

    calculateSubtotal = (lessons) =>{
        if(lessons != null){
            var subtotal  = 0;

            lessons.map((lesson,index)=>{
                var ppl = lesson.payPerLesson;
                subtotal = subtotal +ppl
            })
            
         
            this.setState({subtotal:subtotal})

        }else{
            this.setState({subtotal:null})
        }
    }
    toggleModal = () =>{
        
        this.setState({showModal:!this.state.showModal})
    }
    deleteLesson = async () =>{
        this.toggleModal()
        console.log()
        await axios.delete('/api/taken-lessons/delete?id='+this.state.lessonToDeleteId,{headers:this.state.options})
        .then(response =>{
            console.log(response)
        })

        this.setState({justSaved:true})
                
                setTimeout(()=>
                    this.setState({justSaved:false})
                , 3000);

        this.search();
      
    }

    setLesson = (e,id)=>{
        this.setState({lessonToDeleteId:id})
        this.toggleModal()
    }

    render(){
        return (
            <div >
            <div id="MyLessonsContainer" className="container">
                <h1 className="pd-sm ">My Lessons</h1>
                {
                    this.state.justSaved?
                        <div class="alert alert-success" role="alert">
                            Changed saved!
                        </div>
                    :null
                }
                    <div className="row">
                    <div className="col">
                            <form>
                                <div class="form-group">
                                    <label ><h4>From : </h4> </label>
                                    <DatePicker className="form-control"
                                    selected={this.state.fromDate}
                                    onChange={date => this.setState({fromDate:date})}
                                    /> 
                                </div>
                                <div class="form-group">
                                    <label ><h4>To : </h4></label>
                                    <DatePicker className="form-control"
                                    selected={this.state.toDate}
                                    onChange={date => this.setState({toDate:date})}
                                    /> 
                                </div>


                            
                            </form>
                
                           
                                <button className="btn btn-primary mb-3"
                                    onClick={this.search}
                                >Search</button>
                            
                </div>

                <div className="col">
                    {this.state.isResults?
                    
                        this.state.subtotal?
                            <button className="btn btn-success" disabled={true} >{'£ '+ this.state.subtotal}</button>
                        :null
                    
                    :null}
                </div>

                </div>

                

      

                <div>
                    {this.state.isResults?
                    
                        this.state.takenLessons?
                        
                            this.state.takenLessons.length > 0 ?
                            
                                <div>
                                    <table className="table table-responsive">
                                        <thead>
                                            <th>
                                                Date
                                            </th>
                                            <th>
                                                Name
                                            </th>
                                            <th>
                                                Subject
                                            </th>
                                            <th>
                                                Correction
                                            </th>
                                            <th>
                                                RPH
                                            </th>
                                            <th>
                                                Hours
                                            </th>
                                            <th>
                                                PPL
                                            </th>
                                            <th>
                                                Delete
                                            </th>

                                        </thead>
                                        <tbody>
                                           
                                           {this.state.takenLessons.map((item,index)=>(
                                               <tr>
                                                   <td>
                                                       {new Date(item.date).formatDDMMYYYY()}
                                                   </td>
                                                   <td>
                                                       {item.student.firstName}
                                                   </td>
                                                   <td>
                                                       {item.subject}
                                                   </td>
                                                   <td>
                                                       {item.correction}
                                                   </td>
                                                   <td>
                                                       {item.rate}
                                                   </td>
                                                   <td>
                                                       {item.hours}
                                                   </td>
                                                   <td>
                                                       {item.payPerLesson}
                                                   </td>
                                                   <td>
                                                       {new Date(item.date) <= this.state.maxDate && new Date(item.date) >= this.state.minDate?
                                                        <button className="btn btn-danger"
                                                        onClick={e=>this.setLesson(e,item._id)}
                                                       >x</button>
                                                       
                                                       
                                                       :
                                                       <button className="btn btn-danger"
                                                        disabled={true}
                                                       >x</button>
                                                       
                                                       
                                                       }

                                                        
                                                   </td>
                                               </tr>
                                           ))}

                                        </tbody>
                                    </table>

                                </div>
                                    

                            :<div><button className="btn btn-warning" disabled={true}>No Lessons Found !</button></div>

                        :null
                        
                    :null}
                </div>

                <Modal isOpen={this.state.showModal} toggle={this.toggleModal} >
                        <ModalHeader >You are about to remove a lesson</ModalHeader>
                        <ModalBody>
                           the lesson will be removed for today, to remove permenantly please contact an admin, providing the student's name and subject
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={this.deleteLesson}>Remove Lesson</Button>{' '}
                            <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                
            </div>
            </div>
        )
    }

}

export default MyLessons