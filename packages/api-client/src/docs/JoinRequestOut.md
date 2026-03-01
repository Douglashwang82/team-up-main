
# JoinRequestOut


## Properties

Name | Type
------------ | -------------
`id` | string
`applicantUserId` | string
`applicantName` | string
`applicantEmail` | string
`applicantPhone` | string
`message` | string
`status` | string
`createdAt` | Date
`reviewedAt` | Date

## Example

```typescript
import type { JoinRequestOut } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "applicantUserId": null,
  "applicantName": null,
  "applicantEmail": null,
  "applicantPhone": null,
  "message": null,
  "status": null,
  "createdAt": null,
  "reviewedAt": null,
} satisfies JoinRequestOut

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as JoinRequestOut
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


