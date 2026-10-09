# 📌 AI 코딩 에이전트용 프롬프트 명세서: Post-it Todo List

## 1. 개요 (Overview)
본 프로젝트는 Next.js, Tailwind CSS, shadcn/ui 기반의 **Post-it Todo List 웹 서비스**입니다.
사용자가 입력한 메모를 카테고리별 포스트잇 카드 형태로 시각화하며, 드래그 앤 드롭, 카테고리 필터링, 다크 모드, 애니메이션 효과를 제공합니다.

---

## 2. 핵심 기술 스택 (Tech Stack)
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS, shadcn/ui
- **Icons**: Lucide React (`Trash2`, `Pencil`, `Sun`, `Moon`, `ChevronDown` 등)
- **Drag & Drop**: `@hello-pangea/dnd` 또는 `dnd-kit` (모바일 터치 이벤트 지원 필수)
- **Animation**: Framer Motion
- **Theme**: `next-themes`

---

## 3. 기능별 상세 명세 (Feature Specifications)

### 3.1 메인 레이아웃 및 포스트잇 그리드
- **입력 폼 (Input Section)**:
  - 메인 페이지 중앙 상단에 메모 입력 텍스트 상자 및 카테고리 선택 드롭다운 배치
  - 메모 작성 후 추가 버튼 클릭 시 포스트잇 카드로 생성
- **그리드 레이아웃 (Grid Layout)**:
  - 데스크톱 화면 기준 **한 행에 최대 4개**의 포스트잇 배치 (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`)
- **포스트잇 스타일 & 랜더링 (Post-it Card Style)**:
  - **색상 무작위 적용**: `노란색(#FEF08A)`, `분홍색(#FBCFE8)`, `초록색(#BBF7D0)`, `파랑색(#BFDBFE)` 중 1종 무작위 할당
  - **애니메이션**: 메모 생성/배치 시 '착' 하고 달라붙는 느낌의 애니메이션 적용 (`Framer Motion`의 `scale` 및 `spring` 효과 활용)
  - **작성 일시 표시**: 메모 카드 **왼쪽 하단**에 `YYYY.MM.DD (요일) HH:mm` 형식의 연월일 시간 요일을 작은 글씨 및 흐릿한 톤으로 표시 (`text-xs opacity-60`)
  - **액션 버튼**: 각 포스트잇 상단 또는 우측 하단에 **수정(Edit)** 및 **삭제(Delete)** 버튼 배치

### 3.2 카테고리 및 필터링 (Category & Filtering)
- **카테고리 목록**: `전체`, `할 일`, `아이디어`, `기타`
- **드롭다운 필터 (Select Dropdown)**:
  - 카테고리 선택 시 해당하는 포스트잇만 필터링하여 그리드에 출력

### 3.3 드래그 앤 드롭 (Drag and Drop)
- 포스트잇 카드를 드래그하여 자유롭게 순서를 변경 가능
- **반응형 모바일 지원**: 터치 동작(Touch Event)을 원활하게 지원하는 라이브러리 설정 적용

### 3.4 테마 모드 (Theme)
- **라이트 모드 / 다크 모드 지원**: 기본값은 **라이트 모드**
- 상단 헤더 영역에 테마 전환 스위치/버튼 배치

---

## 4. AI 코딩 에이전트 사용 프롬프트 (Prompt Template)

AI 코딩 에이전트에 아래 프롬프트를 **그대로 입력**하여 개발을 지시하세요.

```text
Post-it Todo List 웹 서비스를 작성해 주세요. 아래 명세에 따라 Next.js(App Router), Tailwind CSS, Framer Motion, shadcn/ui를 활용하여 작성해 주세요.

[요구사항]
1. 메인페이지 중앙 상단에 메모 입력창과 카테고리 선택(할 일, 아이디어, 기타) 드롭다운을 작성하고, 추가 시 포스트잇 카드가 즉시 생성되게 해주세요.
2. 포스트잇 그리드:
   - 반응형으로 한 행에 최대 4개까지 배치 (grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4).
   - 카드 배경색은 노란색(#FEF08A), 분홍색(#FBCFE8), 초록색(#BBF7D0), 파랑색(#BFDBFE) 중 무작위 적용.
   - 포스트잇이 착 붙는 듯한 애니메이션 효과 적용 (Framer Motion spring 또는 scale 애니메이션).
3. 메모 카드 상세:
   - 각 카드의 왼쪽 하단에 작성 일시(YYYY.MM.DD (요일) HH:mm)를 작은 글씨로 흐릿하게 표시.
   - 카드 내 편집(Edit) 버튼과 삭제(Delete) 버튼 포함.
4. 필터링 기능:
   - 카테고리 드롭다운 (전체, 할 일, 아이디어, 기타)을 통해 필터링 가능하도록 구현.
5. 드래그 앤 드롭:
   - 메모 카드를 드래그하여 순서를 바꿀 수 있도록 구현 (모바일 터치 이벤트 포함 지원).
6. 테마:
   - next-themes를 활용하여 라이트/다크 모드 기능 추가 (기본 설정: 라이트 모드).