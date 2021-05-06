## Airport route finder
Implementation of Dijkstra algorithm with additional conditional for finding the shortest path between airports with max 3 stops/layovers

### service initialization

```javascript
npm i && npm run build && npm run dev
```

### GET /routes
Returns shortest path between airports.

<table>
  <tr>
    <th>query_parameter</th>
    <th>description</th>
  </tr>
  <tr>
	<tr>
		<td>src</td>
		<td>IATA code</td>
	</tr>
	<tr>
		<td>dest</td>
		<td>IATA code</td>
	</tr>
  </tr>
</table>

### Unit tests
```javascript
npm run test
```
