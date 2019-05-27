$(document).on('turbolinks:load', function () {
  window.$.getJSON('/search_index.json', function (response) {
    const fuse = new Fuse(response, {
      keys: [
        { name: 'title', weight: 0.8},
        { name: 'contents', weight: 0.2}
      ],
      shouldSort: true,
      minMatchCharLength: 3,
      threshold: 0.3,
      distance: 45000,
      location: 0,
      includeMatches: true,
   });
    let highlightTitle = (text, indices) => {
      let offset = 0
      for(var i = 0; i < indices.length; i++){
       text = text.substring(0, indices[i][0] + offset) + "<b>" + text.substring(indices[i][0] + offset, indices[i][1] + 1 + offset) + "</b>"  + text.substring(indices[i][1] + 1 + offset, text.length)
       offset += 7 // "<b></b>".length = 7 offset by the length of the new <b> tags
      }
      return text;
    }

    let highlightContents = (text, indices) => {
      // TODO: optimize later: find surrounding matches and highligh does, no need to highlight everything.
      let offset = 0
      for(var i = 0; i < indices.length; i++){
       text = text.substring(0, indices[i][0] + offset) + "<b>" + text.substring(indices[i][0] + offset, indices[i][1] + 1 + offset) + "</b>"  + text.substring(indices[i][1] + 1 + offset, text.length)
       offset += 7 // "<b></b>".length = 7 offset by the length of the new <b> tags
      }

      let match = largestMatch(indices)
      let start = Math.max(match[0] - 75, 0)
      return text.substring(start, match[1] + 75)
    }

    let largestMatch = (indices) => {
      let maxDist = 0
      let maxIdx = 0
      let curDist = 0;
      for(var i = 0; i < indices.length; i++ ){
        let curDist = indices[i][1] - indices[i][0]
        if (curDist > maxDist) {
          maxIdx = i
          maxDist = curDist
        }
      };
      return indices[maxIdx];
    }

    $('.search-box').on('keyup', function () {
      let records = fuse.search($(this).val());
      let resultContainer = $('.results-container');

      if (records.length === 0) {
        resultContainer.hide();
      } else {
        resultContainer.empty();
        for (let record of records.slice(0,10)) {
          let contents = record.item.contents.substring(0, 120);
          let title = record.item.title;

          for(let match of record.matches) {
            if(match.indices.length > 0){
              if(match.key == "title"){
               title = highlightTitle(record.item.title, match.indices)
              }else{
               contents = highlightContents(record.item.contents, match.indices)
              }
            }
          }
          let searchResult = `
            <a class='search-result-link' href=/${record.item.path}>
              <li class='search-result'>
                <p class='search-result-title'> ${title} </p>
                <p class='search-result-match'> ${contents} </p>
              </li>
            </a>`
          resultContainer.append(searchResult);
        }
        resultContainer.show();
      }
    });
  });
});

