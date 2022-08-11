import {Project,ProjectStatus} from '../model/project.js'


type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = []; // 상속받은 클래스 내에서 사용가능하게 하면서 외부접근은 막기 위해 protected 사용.

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn); // 함수 참조 배열
  }
}

// project state
export class ProjectState extends State<Project>{

  private projects: Project[] = [];
  private static instance: ProjectState

  private constructor() {
    super();
  }

  // 전역으로 사용되는 상태기 때문에 하나의 객체만 만들어서 관리 singleton
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }



  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    )

    this.projects.push(newProject);
    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find(prj => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {

    // 새로운 변화가 있을떄마다 모든 리스너 함수를 체크
    for (const listenerFn of this.listeners) {
      // 리스너 함수 원본이 아닌 복사된 것을 이용 
      // ( 원래 배열을 전달하면 외부에서도 변경이 가능하고 
      // 여기에서 무었을 변경한것을 push하면 앱의 모든곳에서 원본이 변경이 되버리기 때문
      // 여기서는 우선은 변경을 알아차리지 못하게 하기 위해 복사된 참조를 사용 )
      listenerFn(this.projects.slice());

    }
  }

}

export const projectState = ProjectState.getInstance();