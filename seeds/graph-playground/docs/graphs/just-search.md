# just-search
  - Original: [`just-search.ts`](../../src/boards/just-search.ts)
  - Graph: [`just-search.json`](../../graphs/just-search.json)
  
  ```mermaid
  %%{init: 'themeVariables': { 'fontFamily': 'Fira Code, monospace' }}%%
graph TD;
secrets1("secrets
id='secrets-1'"):::secrets -- "API_KEY->API_KEY" --o url_template3["url_template
id='url_template-3'"]
secrets1("secrets
id='secrets-1'"):::secrets -- "GOOGLE_CSE_ID->GOOGLE_CSE_ID" --o url_template3["url_template
id='url_template-3'"]
jsonata5["jsonata
id='jsonata-5'"] -- "result->text" --> output6{{"output
id='output-6'"}}:::output
fetch4["fetch
id='fetch-4'"] -- "response->json" --> jsonata5["jsonata
id='jsonata-5'"]
url_template3["url_template
id='url_template-3'"] -- "url->url" --> fetch4["fetch
id='fetch-4'"]
input2[/"input
id='input-2'"/]:::input -- "text->query" --> url_template3["url_template
id='url_template-3'"]
keyssecrets1[keys]:::config -- "keys->keys" --o secrets1
messageinput2[message]:::config -- "message->message" --o input2
templateurl_template3[template]:::config -- "template->template" --o url_template3
expressionjsonata5[expression]:::config -- "expression->expression" --o jsonata5
classDef default stroke:#ffab40,fill:#fff2ccff,color:#000
classDef input stroke:#3c78d8,fill:#c9daf8ff,color:#000
classDef output stroke:#38761d,fill:#b6d7a8ff,color:#000
classDef passthrough stroke:#a64d79,fill:#ead1dcff,color:#000
classDef slot stroke:#a64d79,fill:#ead1dcff,color:#000
classDef config stroke:#a64d79,fill:#ead1dcff,color:#000
classDef secrets stroke:#db4437,fill:#f4cccc,color:#000
classDef slotted stroke:#a64d79
  ```