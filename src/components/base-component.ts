namespace App{
//컴포넌트 클래스
  //데이터 타입이 가변적이라 제네릭을 이용
  export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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



}