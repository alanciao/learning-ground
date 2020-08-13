interface Config {
  url:string;
  onerror?:Function;
  onsuccess?:Function;
}

class ScriptLoader {
  public loaded:{[key:string]:any} = {};
  public loading:{[key:string]:any} = {};

  public add(config:Config) {
    // TODO
    console.log('add sound font ' + config.url);
  }
}

export const localScriptLoader = new ScriptLoader();