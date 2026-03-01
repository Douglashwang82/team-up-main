
# EventUpdateIn


## Properties

Name | Type
------------ | -------------
`title` | string
`description` | string
`maxParticipants` | number
`visibility` | string
`durationType` | string
`status` | string

## Example

```typescript
import type { EventUpdateIn } from ''

// TODO: Update the object below with actual values
const example = {
  "title": null,
  "description": null,
  "maxParticipants": null,
  "visibility": null,
  "durationType": null,
  "status": null,
} satisfies EventUpdateIn

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EventUpdateIn
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


