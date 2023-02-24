import  {Component} from 'react'
 

class StudentRow extends Component {

    constructor(props){
        super(props)
        this.state = {showLessons:false}
    }

    toggleShowLessons = () =>{
        this.setState({showLessons:!this.state.showLessons})
    }

    render(){
        return(
       
        <div>
           <div>
                <button className="btn btn-primary mb-5" 
                    onClick={this.toggleShowLessons}
                >{'Student - '+this.props.student.firstName}</button>
           </div>
         {this.state.showLessons?<div>     
                <div className="row">
                    <div className="col">
                        Date
                    </div>
                    <div className="col">
                        Subject
                    </div>
                    <div className="col">
                        Correction
                    </div>
                    <div className="col">
                        Hours
                    </div>
                    <div className="col">
                        Price
                    </div>
                    <div className="col">
                        Fee Per Lesson
                    </div>             
                                
                    
                </div> 
         {
               
                this.props.student.takenLessons.map((lesson,index)=>(
                    <div className="row">
                        <div className="col">
                            {lesson.date}
                        </div>
                        <div className="col">
                            {lesson.subject}
                        </div>
                        <div className="col">
                            {lesson.correction}
                        </div>
                        <div className="col">
                            {lesson.hours}
                        </div>
                        <div className="col">
                            {lesson.price}
                        </div>
                        <div className="col">
                            {lesson.price*lesson.hours*((100-lesson.discount)/100)}
                        </div>               
                        
                    </div>    
                ))

                
        
         }

         </div>:null}
            
        </div>
         
        )
    }

}

export default StudentRow