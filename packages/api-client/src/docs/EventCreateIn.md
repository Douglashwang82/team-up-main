
# EventCreateIn


## Properties

Name | Type
------------ | -------------
`title` | string
`description` | string
`maxParticipants` | number
`venueId` | string
`courtId` | string
`visibility` | string
`durationType` | string
`status` | string

## Example

```typescript
import type { EventCreateIn } from ''

// TODO: Update the object below with actual values
const example = {
  "title": Weekend Basketball Game,
  "description": Looking for players for a friendly game,
  "maxParticipants": 10,
  "venueId": null,
  "courtId": null,
  "visibility": null,
  "durationType": null,
  "status": null,
} satisfies EventCreateIn

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EventCreateIn
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


