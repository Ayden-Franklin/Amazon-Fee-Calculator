import { parseTier } from '../../app/service/parser/parser-us'
const content = `<table class="help-table">               
<thead>
<tr>                     
<th id="N10061">Product size tier</th>

                            <th id="N10065">Unit weight*</th>

                            <th id="N10069">Longest side</th>

                            <th id="N1006D">Median side</th>

                            <th id="N10071">Shortest side</th>

                            <th id="N10075">Length + girth</th>

                        
</tr>

                    
</thead>

                    
<tbody>
                        
<tr>
                            
<td><strong>Small standard-size </strong></td>

                            <td>16 oz</td>

                            <td>15 inches</td>

                            <td>12 inches</td>

                            <td>0.75 inch</td>

                            <td>n/a</td>

                        
</tr>

                        
<tr>
                            
<td><strong>Large standard-size </strong></td>

                            <td>20 lb</td>

                            <td>18 inches</td>

                            <td>14 inches</td>

                            <td>8 inches</td>

                            <td>n/a</td>

                        
</tr>

                        
<tr>
                            
<td><strong>Small oversize </strong></td>

                            <td>70 lb</td>

                            <td>60 inches</td>

                            <td>30 inches</td>

                            <td>n/a</td>

                            <td>130 inches</td>

                        
</tr>

                        
<tr>
                            
<td><strong>Medium oversize </strong></td>

                            <td>150 lb</td>

                            <td>108 inches</td>

                            <td>n/a</td>

                            <td>n/a</td>

                            <td>130 inches</td>

                        
</tr>

                        
<tr>
                            
<td><strong>Large oversize </strong></td>

                            <td>150 lb</td>

                            <td>108 inches</td>

                            <td>n/a</td>

                            <td>n/a</td>

                            <td>165 inches</td>

                        
</tr>

                        
<tr>
                            
<td><strong>Special oversize</strong></td>

                            <td>Over 150 lb</td>

                            <td>Over 108 inches</td>

                            <td>n/a</td>

                            <td>n/a</td>

                            <td>Over 165 inches</td>

                        
</tr>

                    
</tbody>

                
</table>`
test('Parse tier, there should be 6 items', () => {
  const tiers: ITier[] = parseTier(content)
  expect(tiers.length).toBe(6)
})
