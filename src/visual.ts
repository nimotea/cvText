import '../style/visual.less';

export default class Visual extends WynVisual {

  private properties : any;
  private plainDataView : VisualNS.IPlainDataView;
  private dom : HTMLDivElement;
  private selectionManager : VisualNS.SelectionManager;
  private isMock : boolean = true;
  private host : VisualNS.VisualHost;
  constructor(dom: HTMLDivElement, host: VisualNS.VisualHost, options: VisualNS.IVisualUpdateOptions) {
    super(dom, host, options);
    const div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    this.dom = div;
    dom.appendChild(div);
    this.dom.style.overflow = "hidden";
    this.selectionManager = host.selectionService.createSelectionManager();
    this.host = host;
    this.dom.addEventListener("click",this.handle)
  }

  public handle = (event:Event)=>{
      event.stopPropagation();
      event.preventDefault();
      if(!this.isMock){
          let selectionId = this.host.selectionService.createSelectionId();
          this.plainDataView.profile.values.values.forEach((item)=>{
            selectionId.withDimension(item,this.plainDataView.data[0]);
          });
          this.plainDataView.profile.tooltip.values.forEach((item)=>{
            selectionId.withDimension(item,this.plainDataView.data[0]);
          })
          this.selectionManager.select(selectionId,false);
      }
  }

  public update(options: VisualNS.IVisualUpdateOptions) {
    const plainDataView = options.dataViews[0] && options.dataViews[0].plain || null;
    this.properties = options.properties;
    this.plainDataView = plainDataView;
    this.renderTextStyle();
    if (
      plainDataView &&
      (
        plainDataView.profile.values.values.length != 0 ||
        plainDataView.profile.tooltip.values.length != 0 
      )
    ) {
      this.isMock = false;
      let bindFieldName = plainDataView.profile.values.values[0].display;
      let bindFieldValue = plainDataView.data[0][bindFieldName];
      let content = this.properties.content;
      if(this.properties.textType == "variable"){
        this.dom.innerText = `${bindFieldValue}`;
      } else if (this.properties.textType == "mixText") {
        this.dom.innerText = content.replace(/\${var}/g, bindFieldValue)
      }
    } else {
      this.isMock = true
    }
  }

  public renderTextStyle(){
    let fontStyle = this.properties.fontStyle;
    let underLine = this.properties.underLine;
    if(fontStyle && fontStyle["fontFamily"]){
        this.dom.style.fontSize = fontStyle["fontSize"]
        this.dom.style.fontFamily = fontStyle["fontFamily"]
        this.dom.style.fontWeight = fontStyle["fontWeight"]
        this.dom.style.fontStyle = fontStyle["fontStyle"]
        this.dom.style.color = fontStyle["color"]
    }
    this.dom.style.textDecoration = underLine && "underline" || "none";
    if(this.properties.textType == "constant"){
      this.dom.innerText = this.properties["content"];
    }

  }

  public onDestroy(): void {
    this.dom.removeEventListener("click",this.handle);
    this.dom.remove();
  }

  public getInspectorHiddenState(options: VisualNS.IVisualUpdateOptions): string[] {
    if(options.properties.textType == "variable"){
      return ["content"];
    }
    return null;
  }

  public getActionBarHiddenState(options: VisualNS.IVisualUpdateOptions): string[] {
    return null;
  }

  public getColorAssignmentConfigMapping(dataViews: VisualNS.IDataView[]): VisualNS.IColorAssignmentConfigMapping {
    return null;
  }
}