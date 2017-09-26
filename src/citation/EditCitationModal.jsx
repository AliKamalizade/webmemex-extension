import React from 'react'
import { Button, Icon, Modal, Input, Header, ModalContent, ModalActions, Grid, GridColumn, GridRow, Dropdown } from 'semantic-ui-react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import {getCitation} from "./citation"

// A dialog for citations
class EditCitationModal extends React.Component {
    constructor(props) {
        super(props)
        this.pageTitle = document.title
        this.handleModalOpen = this.handleModalOpen.bind(this)
        this.handleModalClose = this.handleModalClose.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.customMetadata = {} // contains references to custom metadata input fields
        this.customMetadataValues = {}
        this.defaultMetadata = {}
        this.pageId = this.props.page._id
        this.citationOptions = [
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
        this.handleCitationSelectChange = this.handleCitationSelectChange.bind(this)
        this.onCitationClick = this.onCitationClick.bind(this)
        this.state = { modalOpen: false, metadata: {}, numberOfCustomMetadata: 0, customMetadata: {}, citation: null, selectedCitationOption: this.citationOptions[0].value }
    }

    // Reinsert custom metadata when shown again
    componentDidUpdate (prevProps, prevState) {
        if (this.state.modalOpen && this.state.numberOfCustomMetadata > 0) {
            ReactDOM.render(this.getCustomMetadataList(), this.getCustomMetadataContainerDom())
        }
    }

    getCustomMetadataContainerDom() {
        return document.getElementById('custom-citation-container')
    }

    // Create custom metadata list. Each entry consists of a label for a custom type of metadata and of its value
    getCustomMetadataList() {
        const result = [...new Array(this.state.numberOfCustomMetadata)].map((el, i) =>
            <li key={i}>
                <Input
                    style={{ display: 'none' }}
                    title={this.customMetadata[i]? this.customMetadata[i].inputRef.value : null}
                    placeholder={`New Metadata name`}
                    defaultValue={this.customMetadata[i]? this.customMetadata[i].inputRef.value : null}
                    ref={(input) => { this.customMetadata[i] = input }}
                />
                <Input
                    title={this.customMetadata[i]? this.customMetadata[i].inputRef.value : null}
                    placeholder={`New Metadata value`}
                    fluid
                    disabled
                    defaultValue={this.customMetadataValues[i]? this.customMetadataValues[i].inputRef.value : null}
                    ref={(input) => { this.customMetadataValues[i] = input }}
                />
            </li>
        )
        return <ul style={{ listStyle: 'none', paddingLeft: 0 }}>{result}</ul>
    }

    // Called when an input is modified
    handleInputChange(e, identifier) {
        const metadata = this.state.metadata
        // Update item and store it
        metadata[identifier] = e.target.value
        this.setState({metadata: metadata})
    }

    handleCitationSelectChange(e, {name, value}) {
        this.setState({selectedCitationOption: value})
    }

    // Open modal, change tab title. Obtain stored metadata and insert it, else insert default
    handleModalOpen() {
        this.setState({modalOpen: true})
        document.title = 'Citation'
        if (Object.keys(this.state.metadata).length === 0) {
            // Insert default metadata from page object
            const defaultMetadata = {}
            defaultMetadata['Title'] = this.props.page.title
            defaultMetadata['Description'] = this.props.page.content ? this.props.page.content.description : null
            defaultMetadata['URL'] = this.props.page.url
            defaultMetadata['Keywords'] = this.props.page.content ? this.props.page.content.keywords : null
            if (this.pageId !== null) {
                // Get all the metadata from storage
                browser.storage.local.get(this.pageId).then((savedPage) => {
                    // Insert default user edited metadata from storage
                    if (savedPage[this.pageId]) {
                        const storedDefaultMetadata = Object.keys(savedPage[this.pageId].defaultMetadata)
                        const numberOfDefaultMetadata = storedDefaultMetadata.length
                        for (let i = 0; i < numberOfDefaultMetadata; i++) {
                            const key = storedDefaultMetadata[i]
                            defaultMetadata[key] = savedPage[this.pageId].defaultMetadata[key]
                        }
                        this.setState({metadata: defaultMetadata})
                        console.log(this.state)
                        // Insert custom metadata from storage
                        const storedCustomMetadata = Object.keys(savedPage[this.pageId].customMetadata)
                        const numberOfCustomMetadata = storedCustomMetadata.length
                        this.setState({numberOfCustomMetadata: numberOfCustomMetadata})
                        ReactDOM.render(this.getCustomMetadataList(), this.getCustomMetadataContainerDom())
                        for (let i = 0; i < numberOfCustomMetadata; i++) {
                            const key = storedCustomMetadata[i]
                            const value = savedPage[this.pageId].customMetadata[key]
                            this.customMetadata[i].inputRef.value = key
                            this.customMetadataValues[i].inputRef.value = value
                        }
                    }
                    console.log(this.customMetadata)
                    // console.log(savedPage[this.pageId])
                    this.setState({customMetadata: savedPage[this.pageId].customMetadata})
                })
            }
            this.setState({metadata: defaultMetadata})
        }
    }

    // Close modal, revert title and save edits in extension storage
    handleModalClose () {
        this.setState({modalOpen: false})
        document.title = this.pageTitle
    }

    getValueAsJson() {
        return {
            "publisher": {
                "value": [
                    "BioMed Central",
                ],
            },
            "journal": {
                "value": [
                    "Journal of Ethnobiology and Ethnomedicine",
                ],
            },
            "title": {
                "value": [
                    "Gitksan medicinal plants-cultural choice and efficacy",
                ],
            },
            "authors": {
                "value": [
                    "Leslie Main Johnson",
                ],
            },
            "date": {
                "value": [
                    "2006-06-21",
                ],
            },
            "volume": {
                "value": [
                    "2",
                ],
            },
            "issue": {
                "value": [
                    "1",
                ],
            },
            "firstpage": {
                "value": [
                    "1",
                ],
            },
            "fulltext_html": {
                "value": [
                    "http://ethnobiomed.biomedcentral.com/articles/10.1186/1746-4269-2-29",
                ],
            },
            "fulltext_pdf": {
                "value": [
                    "http://ethnobiomed.biomedcentral.com/track/pdf/10.1186/1746-4269-2-29?site=http://ethnobiomed.biomedcentral.com",
                ],
            },
            "license": {
                "value": [
                    "This article is published under license to BioMed Central Ltd. This is an Open Access article distributed under the terms of the Creative Commons Attribution License (http://creativecommons.org/licenses/by/2.0), which permits unrestricted use, distribution, and reproduction in any medium, provided the original work is properly cited.",
                ],
            },
            "copyright": {
                "value": [
                    "2006 Johnson; licensee BioMed Central Ltd.",
                ],
            },
        }
    }

    async onCitationClick() {
        const value = this.getValueAsJson()
        // getCitation('Q23571040')
        const cite = await getCitation(value, this.state.selectedCitationOption)
        this.setState({citation: cite})
        getCitation('10.1145/641007.641053')
        getCitation('10.1145/641007.641053', 'citation-apa')
    }

    render() {
        return <Modal
            closeIcon
            open={this.state.modalOpen}
            onClose={e => this.handleModalClose()}
            trigger={
                <Button
                    icon='quote left'
                    id={this.pageId + 'citation'}
                    onClick={e => { e.preventDefault(); this.handleModalOpen() }}
                    floated='right'
                    tabIndex='-1'
                    title={'Citation'}
                />
            }>
            <Header icon='edit' content='Citation' />
            <ModalContent scrolling>
                <form>
                    <Input
                        fluid
                        icon='search'
                        iconPosition='left'
                        title='Title'
                        placeholder='Title'
                        disabled
                        value={this.state.metadata['Title']}
                        onChange={e => { this.handleInputChange(e, 'Title') }}
                    />
                    <Input
                        fluid
                        icon='world'
                        iconPosition='left'
                        placeholder='URL'
                        title={`URL`}
                        type='url'
                        disabled
                        required
                        value={this.state.metadata['URL']}
                        onChange={e => { this.handleInputChange(e, 'URL') }}
                    />
                    <Input
                        fluid
                        icon='comment'
                        iconPosition='left'
                        title='Description'
                        placeholder={`Description`}
                        minLength={2}
                        disabled
                        value={this.state.metadata['Description']}
                        onChange={e => { this.handleInputChange(e, 'Description') }}
                    />
                    <Input
                        fluid
                        icon='tags'
                        iconPosition='left'
                        placeholder={`Keywords`}
                        title={`Keywords`}
                        disabled
                        onChange={e => { this.handleInputChange(e, 'Keywords') }}
                        value={this.state.metadata['Keywords']}
                    />
                    <h5>Custom metadata</h5>
                    <div id='custom-citation-container' />
                    <Dropdown placeholder='Select citation style' selection options={this.citationOptions} defaultValue={this.citationOptions[0].value} onChange={this.handleCitationSelectChange} />
                </form>
                <pre style={{ padding: '20px', whiteSpace: 'normal' }}>
                    {this.state.citation}
                </pre>
            </ModalContent>
            <ModalActions>
                <Button color='red' negative title={'Do not save changes'} onClick={e => this.handleModalClose()}>
                    <Icon name='remove' /> Cancel
                </Button>
                <Button color='green'
                        title={''}
                        onClick={this.onCitationClick}
                >
                    <Icon name='quote left' /> Create citation
                </Button>
            </ModalActions>
        </Modal>
    }
}

EditCitationModal.propTypes = {
    page: PropTypes.object,
}
export default EditCitationModal
