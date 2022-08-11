///<reference path="base-component.ts" />
///<reference path="../decorator/autoBind.ts" />
///<reference path="../util/validation.ts" />
///<reference path="../state/project-state.ts" />

namespace App {
  // 양식 생성 및 사용자 입력 수집 class
  export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
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


}