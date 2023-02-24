
import react, {Component} from 'react';


class RemoveButton extends Component{
    constructor(props){
        super(props)
        
    }
    removeExistingLesson = (e)=>{
        this.props.item.remove = true;
    }

    render(){
        return(
            <div>
                <button className="btn btn-danger"
                    onClick={this.removeExistingLesson}
                >X</button>
            </div>

        )
    }
}

export default RemoveButton