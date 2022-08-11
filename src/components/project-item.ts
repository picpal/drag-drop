///<reference path="base-component.ts" />
///<reference path="../decorator/autoBind.ts" />
///<reference path="../model/project.ts" />
///<reference path="../model/drag-drop.ts" />

namespace App {
  // 프로젝트 항목 관리 ( 프로젝트 자체를 랜더링 하기 위해서 생성 )
  export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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

}