import React from 'react'
import { Button, Icon, Modal, Input, Header, ModalContent, ModalActions, Dropdown } from 'semantic-ui-react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import {getBibTexTypes, createCitation, getCitationStyles, getInputOptions} from "./citation"
import CopyToClipboard from "react-copy-to-clipboard"
import {exportAsFile} from "../overview/actions"

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
        this.citationOptions = getCitationStyles()
        this.inputOptions = getInputOptions()
        this.bibTexTypes = getBibTexTypes()
        this.handleCitationSelectChange = this.handleCitationSelectChange.bind(this)
        this.onCitationClick = this.onCitationClick.bind(this)
        this.handleBibTexSelectChange = this.handleBibTexSelectChange.bind(this)
        this.state = { modalOpen: false, metadata: {}, numberOfCustomMetadata: 0, customMetadata: {}, citation: null, selectedCitationOption: this.citationOptions[0].value, selectedBibTexOption: this.bibTexTypes[0].value }
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

    handleBibTexSelectChange(e, {name, value}) {
        this.setState({selectedBibTexOption: value})
    }

    // Open modal, change tab title. Obtain stored metadata and insert it, else insert default
    handleModalOpen() {
        this.setState({modalOpen: true})
        document.title = 'Create citation'
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
                    if (savedPage[this.pageId]) {
                        this.setState({customMetadata: savedPage[this.pageId].customMetadata})
                    }
                })
            }
            this.setState({metadata: defaultMetadata})
        }
    }

    // Close modal and revert title
    handleModalClose () {
        this.setState({modalOpen: false})
        document.title = this.pageTitle
    }

    // Constructs an object which should be used to generate a citation
    getConstructedInput() {
        const type = this.state.selectedBibTexOption
        let value = '@' + type + '{ ,'
        const length = Object.keys(this.customMetadata).length
        for (let i = 0; i < length; i++) {
            value += this.customMetadata[`${i}`].props.defaultValue + ' = {' + this.customMetadataValues[`${i}`].props.defaultValue + '},'
            // Finally, append title as well as URL and close it
            if ((length - 1) === i) {
                value += 'title = {' + this.state.metadata.Title + '},'
                value += 'url = {' + this.state.metadata.URL + '}}'
            }
        }
        return value
    }

    // takes metadata and tries to create a result in the specified output format
    async onCitationClick() {
        const value = this.getConstructedInput()
        const cite = await createCitation(value, this.state.selectedCitationOption)
        this.setState({citation: cite})
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
                    title={'Create citation'}
                />
            }>
            <Header icon='quote left' content='Create citation' />
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
                    <Dropdown placeholder='Select output format' title={'Select output format'} selection options={this.citationOptions} onChange={this.handleCitationSelectChange} />
                    <Dropdown placeholder='Select input fornat' title={'Select input format'} selection disabled defaultValue={this.inputOptions[0].value} options={this.inputOptions} />
                    <Dropdown placeholder='Select BibTex reference type' title={'Select BibTex reference type'} selection options={this.bibTexTypes} onChange={this.handleBibTexSelectChange} />
                </form>
                <pre style={{ padding: '20px', whiteSpace: 'normal', border: '1px solid rgba(0,0,0,.15)' }}>
                    {this.state.citation}
                    <div style={{ marginTop: '10px' }}>
                        <CopyToClipboard text={this.state.citation}>
                            <Button title={'Copy this citation to clipboard'} style={{ display: this.state.citation && this.state.citation.length > 15? 'initial' : 'none' }} color='blue'>
                                <Icon name='clipboard' /> Copy to clipboard
                            </Button>
                        </CopyToClipboard>
                        <Button title={'Download as .txt file'} style={{ display: this.state.citation && this.state.citation.length > 15 && ((this.state.selectedCitationOption === 'bibtex' || this.state.selectedCitationOption === 'bibtxt'))? 'initial' : 'none' }} color='blue' onClick={e => exportAsFile(this.state.citation, 'WebMemex-Export-Citation')}>
                            <Icon name='download' /> Download
                        </Button>
                    </div>
                </pre>
            </ModalContent>
            <ModalActions>
                <Button color='red' negative onClick={e => this.handleModalClose()}>
                    <Icon name='remove' /> Close
                </Button>
                <Button color='green'
                    title={'The result will be shown above'}
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
