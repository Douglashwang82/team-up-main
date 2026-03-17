
# ChatMessageOut


## Properties

Name | Type
------------ | -------------
`id` | string
`userId` | string
`role` | string
`content` | string
`widget` | { [key: string]: any; }
`createdAt` | Date

## Example

```typescript
import type { ChatMessageOut } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "userId": null,
  "role": null,
  "content": null,
  "widget": null,
  "createdAt": null,
} satisfies ChatMessageOut

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ChatMessageOut
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


