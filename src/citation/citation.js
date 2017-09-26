import Cite from "citation-js"
/**
 *
 * @param input DOI or Wikidata or BibTex or BibJSON or CSL-JSON.
 * @param style
 */
export async function getCitation(input, style='citation-harvard1') {
    const data = await Cite.async(input)
    const result = await data.get({
        format: 'string',
        type: 'string',
        style: style,
        lang: 'en-US',
    })
    console.log(result)
    return result
}
