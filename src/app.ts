// drag & drop 인터페이스
// 인터페이스로 구성을 한 이유는 이걸 사용하는 다른 클래스들이 명시된 메소드를 반드시 실행하도록 강제 하고 싶어서
// drag이벤트는 ts에 포함된 DragEvent lib사용
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  // drag가 유효한 타겟임을 알기 위한 이벤트
  dragOverHandler(event: DragEvent): void;
  // 실제 드롭되는 이벤트
  dropHandler(event: DragEvent): void;
  // drag가 끝나고 사용자에게 끝났음을 알리는 동작을 실행할 때 사용할 이벤트
  dragLeaveHandler(event: DragEvent): void;
}


enum ProjectStatus { Active, Finished }

// project Type
// 항상 동일한 구조를 갖는 프로젝트 객체 구축을 하기 위한 project의 type을 설정
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus,
  ) {

  }
}

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = []; // 상속받은 클래스 내에서 사용가능하게 하면서 외부접근은 막기 위해 protected 사용.

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn); // 함수 참조 배열
  }
}

// project state
class ProjectState extends State<Project>{

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

const projectState = ProjectState.getInstance();

// 객체에 대한 유효 타입정의는 interface를 사용하자!! 
// ( 사용자 정의 type를 사용해도 같은 효과이지만 정형화시켜서 규칙성이 있는 느낌을 주기 위해 )
// 재 사용성을 위해서 입력 값 이외에는 선택사항으로 둠
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }

  if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
  }

  if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
  }

  if (validatableInput.min != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }

  if (validatableInput.max != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }

  return isValid;
}

// autobind 데코레이터
function AutoBind(_target: any, _method: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  }
  return adjDescriptor;
}

//컴포넌트 클래스
//데이터 타입이 가변적이라 제네릭을 이용
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;


  // 신규 생성되는 element에 id는 필수가 아니기 때문에 선택적으로 옵션처리함
  constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string | undefined) {
    // 템플릿 element
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
    // 기준 element
    this.hostElement = document.getElementById(hostElementId)! as T;
    // 추가되는 element
    const importedNode = document.importNode(this.templateElement.content, true);
    // 추가되는 element content를 element에 할당
    this.element = importedNode.firstElementChild as U;
    // 추가되는 element에 부여되는 id 
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);

  }

  private attach(insertAtBegining: boolean) {
    this.hostElement.insertAdjacentElement(insertAtBegining ? 'afterbegin' : 'beforeend', this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

// 프로젝트 항목 관리 ( 프로젝트 자체를 랜더링 하기 위해서 생성 )
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  // getter setter 는 생성자 위 타입선언 밑에 보통 위치
  get persons() {
    if (this.project.people === 1) {
      return '1 명 밖에 없네요..'
    }
    return `${this.project.people} 명 참가!!!`;
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';

  }

  dragEndHandler(_: DragEvent): void {
    // console.log('drag 끝');

  }

  configure(): void {
    this.element.addEventListener('dragstart', this.dragStartHandler)
    this.element.addEventListener('dragend', this.dragEndHandler)
  }

  renderContent(): void {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.persons; // getter 호출 하여 처리
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}

//프로젝트 리스트 관리
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    // this.type 이 아닌 이유는 super가 끝나기전에는 this.xx를 사용할 수 없음. 하지만 매개변수를 사용할 수 있어서 type으로만 명시함
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      // drag 가능한 항목이 아니면 이벤트 막기
      event.preventDefault();

      // 드롭가능한 장소로 이동이 됬을 때, 배경색 처리
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
  }

  @AutoBind
  dropHandler(event: DragEvent) {
    // console.log(event.dataTransfer!.getData('text/plain'));
    const prjId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(prjId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished)
  }

  @AutoBind
  dragLeaveHandler(_: DragEvent) {
    // 드롭가능한 장소에서 떠났을 때, 배경색 처리
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }

  configure(): void {
    this.element.addEventListener('dragover', this.dragOverHandler)
    this.element.addEventListener('dragleave', this.dragLeaveHandler)
    this.element.addEventListener('drop', this.dropHandler)

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(prj => {
        if (this.type === 'active') {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });

      this.assignedProjects = relevantProjects;
      this.renderProjects();
    })
  }

  // 타입스크립트의 추상 method는 private를 지원하지 않는다.
  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';

  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    // 모든 항목을 초기화한 다음 모든 항목 다시 추가
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem)
    }
  }
}

// 양식 생성 및 사용자 입력 수집 class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');

    // 개별 element 접근
    this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement;

    this.configure();
  }

  // form element에 이벤트 추가
  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  renderContent(): void { }

  // 유효하지 않은 값에 대해서는 반환을 하지 않기위해 void 추가 (함수의 반환은 부정형으로 하면안되서 undefind 사용안함)
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = parseFloat(this.peopleInputElement.value);

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    }
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    }
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5
    }

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('유효하지 않은 입력입니다.');
      return;
    } else {
      return [enteredTitle, enteredDescription, enteredPeople]
    }

  }

  // input 항목 초기화
  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  // form element 이벤트
  @AutoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    // tuple type은 타입스크립트에만 존재하지만 기본적으로 배열의 형태를 지니고 있기 때문에 컴파일되면 배열 모양의 자바스크립트로 되어있다.
    // 그래서 검증을 위해 typeof 나 instanceof를 사용 못하기 때문에 배열의 특성으로 확인함
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputs(); // clear input
    }
  }


}

const prjInput = new ProjectInput();
const activePrj = new ProjectList('active');
const finishedPrj = new ProjectList('finished');
