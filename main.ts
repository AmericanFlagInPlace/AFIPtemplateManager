import { NO_JSON_TEMPLATE_IN_PARAMS, UPDATE_PERIOD_MILLIS } from "./constants";
import * as reddit from "./reddit";
import { TemplateManager } from "./templateManager";
import * as utils from "./utils";
import * as settings from "./ui/settingsIcon";

let jsontemplate: string;
let canvasElement: HTMLCanvasElement; // FIXME: This should probably be a list and the user can just select the correct one manually


function findCanvas(element: Element | ShadowRoot) {
    if (element instanceof HTMLCanvasElement) {
        console.log('found canvas', element, window.location.href);
        if (!canvasElement && element.width > 0 && element.height > 0) {
            canvasElement = element;
        } else if (element.width * element.height > canvasElement.width * canvasElement.height) {
            canvasElement = element;
        }
    }

    // find in Shadow DOM elements
    if (element instanceof HTMLElement && element.shadowRoot) {
        findCanvas(element.shadowRoot)
    }
    // find in children
    for (let c = 0; c < element.children.length; c++) {
        findCanvas(element.children[c])
    }
}

function topWindow() {
    console.log("top window code for", window.location.href)
    GM.setValue('canvasFound', false)
    let params = utils.findJSONTemplateInURL(window.location) || NO_JSON_TEMPLATE_IN_PARAMS;
    jsontemplate = params
    GM.setValue('jsontemplate', jsontemplate)
}

async function canvasWindow() {
    console.log("canvas code for", window.location.href)
    let sleep = 0;
    while (!canvasElement) {
        if (await GM.getValue('canvasFound', false) && !utils.windowIsEmbedded()) {
            console.log('canvas found by iframe')
            return;
        }
        await utils.sleep(1000 * sleep);
        sleep++;
        console.log("trying to find canvas")
        findCanvas(document.documentElement)
    }
    GM.setValue('canvasFound', true)
    sleep = 0
    while (true) {
        if (jsontemplate) {
            runCanvas(jsontemplate, canvasElement!)
            break
        } else if (utils.windowIsEmbedded()) {
            jsontemplate = (await GM.getValue('jsontemplate', ''))
        }
        await utils.sleep(1000 * sleep);
        sleep++;
    }
}

function runCanvas(jsontemplate: string, canvasElement: HTMLCanvasElement) {
    let manager = new TemplateManager(canvasElement, jsontemplate)
    settings.init(manager)
    window.setInterval(() => {
        manager.update()
    }, UPDATE_PERIOD_MILLIS);
    GM.setValue('jsontemplate', '')
}

console.log(`running templating script in ${window.location.href}`);
if (!utils.windowIsEmbedded()) {
    // we are the top window
    topWindow()
}
canvasWindow()

let __url = new URL(window.location.href)
if (__url.origin.endsWith('reddit.com')) {
    reddit.run()
}