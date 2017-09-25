import Cite from "citation-js"
/**
 *
 * @param input DOI or Wikidata or BibTex or BibJSON or CSL-JSON.
 * @return {Promise.<void>}
 */
export async function getCitation(input) {
    const data = await Cite.async(input)
    const result = data.get({
        format: 'string',
        type: 'html',
        style: 'citation-apa',
        lang: 'en-US',
    })
    console.log(result)
}
