import get from 'lodash/fp/get'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Popup, Icon, Modal, Input, Header, ModalContent, ModalActions } from 'semantic-ui-react'
import classNames from 'classnames'

import { hrefForLocalPage } from 'src/page-viewer'
import niceTime from 'src/util/nice-time'

import ImgFromPouch from './ImgFromPouch'
import styles from './VisitAsListItem.css'
import {deleteVisit, editVisit} from '../actions'


const VisitAsListItem = ({doc, compact, onTrashButtonClick, onEditButtonClick}) => {
    const href = hrefForLocalPage({page: doc.page})

    const pageSize = get(['_attachments', 'frozen-page.html', 'length'])(doc.page)
    const sizeInMB = pageSize !== undefined
        ? Math.round(pageSize / 1024**2 * 10) / 10
        : 0

    const visitClasses = classNames({
        [styles.root]: true,
        [styles.compact]: compact,
        [styles.available]: !!href,
    })

    const hasFavIcon = !!(doc.page._attachments && doc.page._attachments.favIcon)
    const deleteButton = (
        <div>
            <Popup
                trigger={
                    <Button
                        icon='edit'
                        onClick={e => { e.preventDefault() }}
                        floated='right'
                        tabIndex='-1'
                    />
                }
                content={
                    <div>
                        <Button
                            positive
                            content={`Edit`}
                            onClick={e => { onEditButtonClick() }}
                            title={`Classify the saved web page`}
                        />
                        <Button
                            negative
                            content={`Forget this item`}
                            onClick={e => { onTrashButtonClick() }}
                            title={`Stored page size: ${sizeInMB} MB`}
                        />
                    </div>
                }
                on='focus'
                hoverable
                position='right center'
            />
            {/* TODO Modal dialog */}
            <Modal
                closeIcon
                trigger={
                    <Button
                        icon='edit'
                        onClick={e => { e.preventDefault() }}
                        floated='right'
                        tabIndex='-1'
                    />
                }>
                <Header icon='edit' content='Edit' />
                <ModalContent>
                    <div>
                        <Input
                            fluid
                            icon='search'
                            iconPosition='left'
                            placeholder='Title'
                            title={`Title`}
                            defaultValue={doc.page.url}
                        />
                        <Input
                            fluid
                            icon='tags'
                            iconPosition='left'
                            placeholder='Keywords'
                            title={`Keywords`}
                            defaultValue={doc.page.content.keywords}
                        />
                        <Input
                            fluid
                            icon='comment'
                            iconPosition='left'
                            placeholder='Description'
                            title={`Description`}
                            defaultValue={doc.page.content.description}
                        />
                    </div>
                </ModalContent>
                <ModalActions>
                    <Button color='red' onClick={e => { onEditButtonClick() }}>
                        <Icon name='remove' /> No
                    </Button>
                    <Button color='green' onClick={e => { onEditButtonClick() }}>
                        <Icon name='checkmark' /> Yes
                    </Button>
                </ModalActions>
            </Modal>
        </div>
    )

    const favIcon = hasFavIcon
        ? (
            <ImgFromPouch
                className={styles.favIcon}
                doc={doc.page}
                attachmentId='favIcon'
            />
        )
        : <Icon size='big' name='file outline' className={styles.favIcon} />

    return (
        <a
            href={href}
            title={href ? undefined : `Page not available. Perhaps storing failed?`}
            className={visitClasses}
            // DEBUG Show document props on ctrl+meta+click
            onClick={e => { if (e.metaKey && e.ctrlKey) { console.log(doc); e.preventDefault() } }}
            onKeyPress={e => { if (e.key==='Delete') { onTrashButtonClick() } else if (e.key==='Edit') { onEditButtonClick() } }}
        >
            <div className={styles.screenshotContainer}>
                {doc.page._attachments && doc.page._attachments.screenshot
                    ? (
                        <ImgFromPouch
                            className={styles.screenshot}
                            doc={doc.page}
                            attachmentId='screenshot'
                        />
                    )
                    : favIcon
                }
            </div>
            <div className={styles.descriptionContainer}>
                <div
                    className={styles.title}
                >
                    {hasFavIcon && favIcon}
                    <span title={doc.page.title}>
                        {doc.page.title}
                    </span>
                </div>
                <div className={styles.url}>
                    <a
                        href={doc.page.url}
                    >
                        {doc.page.url}
                    </a>
                </div>
                <div className={styles.time}>{niceTime(doc.visitStart)}</div>
            </div>
            <div className={styles.buttonsContainer}>
                {deleteButton}
            </div>
        </a>
    )
}

VisitAsListItem.propTypes = {
    doc: PropTypes.object.isRequired,
    compact: PropTypes.bool,
    onTrashButtonClick: PropTypes.func,
    onEditButtonClick: PropTypes.func,
}


const mapStateToProps = state => ({})

const mapDispatchToProps = (dispatch, {doc}) => ({
    onTrashButtonClick: () => dispatch(deleteVisit({visitId: doc._id})),
    onEditButtonClick: () => {
        console.log(doc)
        return dispatch(editVisit({visitId: doc._id}))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(VisitAsListItem)
