
# EventParticipantOut


## Properties

Name | Type
------------ | -------------
`id` | string
`userId` | string
`displayName` | string
`email` | string
`phone` | string
`role` | string
`avatarUrl` | string
`joinedAt` | Date

## Example

```typescript
import type { EventParticipantOut } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "userId": null,
  "displayName": null,
  "email": null,
  "phone": null,
  "role": null,
  "avatarUrl": null,
  "joinedAt": null,
} satisfies EventParticipantOut

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EventParticipantOut
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


