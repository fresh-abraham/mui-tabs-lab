export type NavPage = "page1" | "page2";

export type EditorTabState = {
  counter: number;
};

export type EditorTab = {
  id: string;
  label: string;
  state: EditorTabState;
};

export type Page1PanelsOpen = {
  tabs: boolean;
  outline: boolean;
  timeline: boolean;
};

export type Page1PanelWeights = {
  tabs: number;
  outline: number;
  timeline: number;
};

export type EditorGroup = {
  id: string;
  tabs: EditorTab[];
  activeTabId: string;
};

export type WorkspaceState = {
  id: string;
  label: string;

  activePage: NavPage;

  sidebarExpanded: boolean;

  leftPanelWidth: number;

  page1PanelsOpen: Page1PanelsOpen;
  page1PanelWeights: Page1PanelWeights;

  editorGroups: EditorGroup[];
  activeEditorGroupId: string;
};
