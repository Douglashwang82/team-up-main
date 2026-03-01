
# NotificationOut


## Properties

Name | Type
------------ | -------------
`id` | string
`message` | string
`type` | string
`isRead` | boolean
`relatedEntityId` | string
`relatedEntityType` | string
`createdAt` | Date

## Example

```typescript
import type { NotificationOut } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "message": null,
  "type": null,
  "isRead": null,
  "relatedEntityId": null,
  "relatedEntityType": null,
  "createdAt": null,
} satisfies NotificationOut

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NotificationOut
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


