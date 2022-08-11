// drag & drop 인터페이스
// 인터페이스로 구성을 한 이유는 이걸 사용하는 다른 클래스들이 명시된 메소드를 반드시 실행하도록 강제 하고 싶어서
// drag이벤트는 ts에 포함된 DragEvent lib사용
export interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

export interface DragTarget {
  // drag가 유효한 타겟임을 알기 위한 이벤트
  dragOverHandler(event: DragEvent): void;
  // 실제 드롭되는 이벤트
  dropHandler(event: DragEvent): void;
  // drag가 끝나고 사용자에게 끝났음을 알리는 동작을 실행할 때 사용할 이벤트
  dragLeaveHandler(event: DragEvent): void;
}
