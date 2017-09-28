import Cite from "citation-js"

/**
 *
 * @param input DOI or Wikidata or BibTex or BibJSON or CSL-JSON.
 * @param style {string}
 * @param lang {string}
 */
export async function createCitation(input, style='citation-apa', lang = 'en-US') {
    const data = await Cite.async(input)
    const result = await data.get({
        format: 'string',
        type: 'string',
        style: style,
        lang: lang,
    })
    console.log(result)
    return result
}

export function getCitationStyles() {
    return [
        {
            text: 'APA',
            value: 'citation-apa',
        },
        {
            text: 'Harvard',
            value: 'citation-harvard1',
        },
        {
            text: 'Vancouver',
            value: 'citation-vancouver',
        },
    ]
}

export function getBibTexTypes() {
    return [
        {
            text: 'Article',
            value: 'article',
        },
        {
            text: 'Book',
            value: 'book',
        },
        {
            text: 'Booklet',
            value: 'booklet',
        },
        {
            text: 'Conference',
            value: 'conference',
        },
        {
            text: 'Inbook',
            value: 'inbook',
        },
        {
            text: 'Incollection',
            value: 'incollection',
        },
        {
            text: 'Inproceedings',
            value: 'inproceedings',
        },
        {
            text: 'Manual',
            value: 'manual',
        },
        {
            text: 'Masters thesis',
            value: 'mastersthesis',
        },
        {
            text: 'Misc',
            value: 'misc',
        },
        {
            text: 'Ph.D thesis',
            value: 'phdthesis',
        },
        {
            text: 'Proceedings',
            value: 'proceedings',
        },
        {
            text: 'Techreport',
            value: 'techreport',
        },
        {
            text: 'Unpublished',
            value: 'unpublished',
        },
    ]
}

export function getInputOptions() {
    return [
        {
            text: 'BibTex',
            value: 'BibText',
        },
        {
            text: 'DOI',
            value: 'DOI',
        },
        {
            text: 'Wikidata',
            value: 'Wikidata',
        },
    ]
}
