# simplest
  - Original: [`simplest.ts`](../../src/boards/simplest.ts)
  - Graph: [`simplest.json`](../../graphs/simplest.json)
  
  ```mermaid
  %%{init: 'themeVariables': { 'fontFamily': 'Fira Code, monospace' }}%%
graph TD;
secrets2("secrets
id='secrets-2'"):::secrets -- "API_KEY->API_KEY" --> textcompletion1["text-completion
id='text-completion-1'"]
textcompletion1["text-completion
id='text-completion-1'"] -- "completion->text" --> output4{{"output
id='output-4'"}}:::output
input3[/"input
id='input-3'"/]:::input -- "text->text" --> textcompletion1["text-completion
id='text-completion-1'"]
keyssecrets2[keys]:::config -- "keys->keys" --o secrets2
classDef default stroke:#ffab40,fill:#fff2ccff,color:#000
classDef input stroke:#3c78d8,fill:#c9daf8ff,color:#000
classDef output stroke:#38761d,fill:#b6d7a8ff,color:#000
classDef passthrough stroke:#a64d79,fill:#ead1dcff,color:#000
classDef slot stroke:#a64d79,fill:#ead1dcff,color:#000
classDef config stroke:#a64d79,fill:#ead1dcff,color:#000
classDef secrets stroke:#db4437,fill:#f4cccc,color:#000
classDef slotted stroke:#a64d79
  ```