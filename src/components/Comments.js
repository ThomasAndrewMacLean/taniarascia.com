import React, { Component } from 'react'
import moment from 'moment'
import config from '../../data/SiteConfig'

export default class Comments extends Component {
  constructor(props) {
    super(props)

    this.initialState = {
      submitting: false,
      comments: [],
      newComment: {
        name: '',
        website: '',
        text: '',
        slug: this.props.slug,
      },
      success: false,
      error: false,
    }

    this.state = this.initialState
  }

  componentDidUpdate(prevProps) {
    const { commentsList } = this.props

    if (prevProps.commentsList !== commentsList && commentsList.length > 0) {
      this.setState({ comments: commentsList })
    }
  }

  onSubmitComment = async event => {
    event.preventDefault()

    this.setState({ submitting: true })

    const { newComment, comments } = this.state
    const { slug } = this.props

    const response = await fetch(config.commentsApi, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'post',
      body: JSON.stringify(newComment),
    })

    if (response.status === 201) {
      this.setState(prevState => ({
        ...prevState,
        comments: [newComment, ...comments],
        newComment: {
          name: '',
          website: '',
          text: '',
          slug,
        },
        success: true,
        error: false,
      }))
    } else {
      this.setState({ ...this.initialState, error: true })
    }
  }

  handleChange = event => {
    const { newComment } = this.state
    const { name, value } = event.target

    this.setState({
      newComment: { ...newComment, [name]: value },
    })
  }

  render() {
    const {
      submitting,
      success,
      error,
      comments,
      newComment: { name, text },
    } = this.state

    const showError = () =>
      error && (
        <blockquote className="error">
          <p>Comment failed to submit.</p>
        </blockquote>
      )
    const showSuccess = () =>
      success && (
        <blockquote className="success">
          <p>Comment submitted!</p>
        </blockquote>
      )

    const commentTitle = commentLength => {
      if (commentLength < 1) {
        return 'Leave a comment'
      } else if (commentLength === 1) {
        return '1 comment'
      } else {
        return `${commentLength} comments`
      }
    }

    return (
      <section className="comments" id="comments">
        {success || error ? (
          showError() || showSuccess()
        ) : (
          <>
            <h3>{commentTitle(comments.length)}</h3>
            <form id="new-comment" onSubmit={this.onSubmitComment}>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={this.handleChange}
                minLength="3"
                maxLength="255"
                placeholder="Name"
                required
              />
              <textarea
                rows="3"
                cols="5"
                name="text"
                id="text"
                value={text}
                onChange={this.handleChange}
                minLength="20"
                maxLength="1000"
                required
              />
              <p>
                <small>Plain text only. Comment must be over 20 characters.</small>
              </p>
              {name && text && text.length > 20 && (
                <button type="submit" disabled={!name || !text || text.length < 20 || submitting}>
                  Add response
                </button>
              )}
            </form>
          </>
        )}
        {comments.length > 0 &&
          comments.map((comment, i) => (
            <div className="comment" key={i}>
              <header>
                <h2>{comment.name}</h2>
                <div className="comment-date">{moment(comment.date).fromNow()}</div>
              </header>
              <p>{comment.text}</p>
            </div>
          ))}
      </section>
    )
  }
}
