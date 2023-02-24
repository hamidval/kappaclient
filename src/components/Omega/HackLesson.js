import react ,{Component} from 'react'
import axios from 'axios'
import MyLessons from './MyLessons';
class HackLesson extends Component{

    constructor(props){
        super(props)
        this.state = {
            teachers: null,
            teacherToHackId:null,
            teacherToHackUserId:null,
            options :{ userid:this.props.userId }
           }
    }

    componentDidMount =  async ()=>{
        await axios.get('/api/teachers/all',
        {headers:this.state.options})
        .then(async response => {
             var data = await response.data;
         
             this.setState({teachers:data})
           
         
        });  
    }  

    setTeacherToHack = async (index) =>{
        var teacher = this.state.teachers[index];
        console.log(teacher);
        this.setState({teacherToHackId:teacher._id})
        this.setState({teacherToHackUserId:teacher.userId})

    }
    


    render(){
        return(
            <div className="container">
                <h1>Hack Teacher</h1>

                <table className="table table-responsive table-light">
                        <thead>
                            <th>
                                <tr>Full Name</tr>
                            </th>
                            <th>
                                <tr>Email</tr>
                            </th>
                      
                            <th>
                                <tr>Bonus</tr>
                            </th>
                            <th>
                                <tr>Role</tr>
                            </th>
                            <th>
                                <tr>-</tr>
                            </th>
                
                        </thead>
                        <tbody>
                        {
                            this.state.teachers?.length>0?
                                this.state.teachers.map((item,index)=>(
                                    <tr>
                                        <td>{item.fullName}</td>
                                        <td>{item.email}</td>
                                        <td>{item.bonus}</td>
                                        <td>{item.role}</td>
                                        <td><button className="btn btn-danger" onClick={e=>this.setTeacherToHack(index)}>Hack</button></td>
                                    </tr>

                                ))
                            :null
                        }
                        </tbody>
                    </table>

                    <div>
                        {
                            this.state.teacherToHackId?
                            <MyLessons id={this.state.teacherToHackId} userId={this.state.teacherToHackUserId} role={2} />
                         
                            :null
                        }
                    </div>
                
            </div>
        )
    }
}

export default HackLesson