'use strict';

class ArgParser {
  /**
   * Parse "get 2.foo bar"
   * @param {string}   search    2.foo
   * @param {Iterable} list      Where to look for the item
   * @param {boolean}  returnKey If `list` is a Map, true to return the KV tuple instead of just the entry
   * @return {*} Boolean on error otherwise an entry from the list
   */
  static parseDot(search, list, returnKey = false) {
    
    if (!list) {
      return null;
    }

    //reverse inventory lists
   if (list.maxSize){
    list = new Map([...list].reverse());
   }

   let findNth, keyword, searchArr

  //
   if (!Array.isArray(search)) {
     //Parser should either handle dot notation OR multiple words. But not both.
    let dots = search.split('.');
    if (dots.length > 1) {
      //either parse dots
        const parts = search.split('.');
        findNth = 1;
        keyword = null;

        //Fail if there are two .'s in the string.
        if (parts.length > 2) {
          return false;
        }

        if (parts.length === 1) {
          keyword = parts[0];
        } else {
          findNth = parseInt(parts[0], 10);
          keyword = parts[1];
        }
    } else {
      //or no dots
        keyword = search;

      findNth = 1;
    }
  } else {
    searchArr = search;
  }

    //go through each entity in the list
    let encountered = 0;
    for (let entity of list) {
      let key, entry;
      if (Array.isArray(entity)) {
        [key, entry] = entity;
      } else {
        entry = entity;
      }

      if (!('keywords' in entry) && !('name' in entry)) {
        throw new Error('Items in list have no keywords or name');
      }
      let matches=0;
      let nameMatches=0;
      //if multiple search words are used
      if (Array.isArray(searchArr)) {
        //go through each of the search words
        for (let searchWord of searchArr) {
          if (entry.keywords && entry.keywords.some((k)=> searchWord.includes(k))) {
            matches++;
          }
          if (entry.name && entry.name.toLowerCase().split(" ").includes(searchWord.toLowerCase())) {
            nameMatches++;
          }
        }
        if (matches == searchArr.length || nameMatches == searchArr.length) {
          return returnKey ? [key, entry] : entry;
        }
      } else {
        //single search word used

      // prioritize keywords over item/player names
      if (entry.keywords && (entry.keywords.some( k => keyword.includes(k) || entry.uuid === keyword))) {
        encountered++;
        if (encountered === findNth) {
          return returnKey ? [key, entry] : entry;
        }
        // if the keyword matched skip to next loop so we don't double increment
        // the encountered counter
        continue;
      }

      //check entity name as well
      if (entry.name && entry.name.toLowerCase().split(" ").includes(keyword.toLowerCase())) {
        encountered++;
        if (encountered === findNth) {
          return returnKey ? [key, entry] : entry;
        }
      }
    }
  }
}
}
module.exports = ArgParser;
