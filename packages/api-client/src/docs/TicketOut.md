
# TicketOut


## Properties

Name | Type
------------ | -------------
`id` | string
`date` | Date
`startTime` | string
`sportType` | string
`intensity` | string
`status` | string
`createdAt` | Date
`message` | string

## Example

```typescript
import type { TicketOut } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "date": null,
  "startTime": null,
  "sportType": null,
  "intensity": null,
  "status": null,
  "createdAt": null,
  "message": null,
} satisfies TicketOut

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TicketOut
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


