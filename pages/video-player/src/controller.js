export default class Controller {
    #view
    #camera
    #worker
    #blinktype


    constructor({view, worker,camera}) {
        this.#view = view
        this.#worker = this.#configureWorker(worker)
        this.#camera = camera

        this.#view.configureOnBtnClick(this.onBtnStart.bind(this))
    }

    static async initialize(deps) {
        const controller = new Controller(deps)
        controller.log('not yet detecting eye blink! click in the button to start')
        return controller.init()
      }
    
    #configureWorker(worker){
        let ready = false
        worker.onmessage = ({data}) => {
            if('READY' === data){
                console.log("worker is ready")
                this.#view.enableButton()
                ready = true
                return
            }
            this.#blinktype  = data.blinked
            if (this.#blinktype === 'Both'){
                this.#view.togglePlayVideo()
            }
            
        }
        return {
            send(msg){
                if(!ready) rerturn;
                worker.postMessage(msg)        
            }
        }
    }

    async init() {
        console.log ("init")
    }
    log(text){
        this.#view.log(`status: ${text}`.concat(this.#blinktype? `- Blinked ${this.#blinktype}` : ''))
    }

    loop(){
        const video = this.#camera.video
        const img = this.#view.getVideoFrame(video)
        this.#worker.send(img)
        this.log('detecting eye blink...')

        setTimeout(() => this.loop(), 100)
    }

    onBtnStart(){
        this.log('initializing detection...')
        this.#blinktype = 0
        this.loop()
    }

}