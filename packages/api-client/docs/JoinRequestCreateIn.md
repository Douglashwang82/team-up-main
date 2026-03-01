
# JoinRequestCreateIn


## Properties

Name | Type
------------ | -------------
`applicantName` | string
`applicantEmail` | string
`applicantPhone` | string
`message` | string

## Example

```typescript
import type { JoinRequestCreateIn } from ''

// TODO: Update the object below with actual values
const example = {
  "applicantName": null,
  "applicantEmail": null,
  "applicantPhone": null,
  "message": null,
} satisfies JoinRequestCreateIn

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as JoinRequestCreateIn
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


