import React from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import clone from 'lodash.clonedeep';
import equal from 'deep-equal';
import { Link } from 'react-router-dom';

export default class ScopeEditor extends React.Component {
  static propTypes = {
    // true to display the editor; expandedScopes can just display
    // by leaving this unset
    editing: bool,
    scopes: arrayOf(string).isRequired,
    // called when scopes have changed
    scopesUpdated: func
  };

  componentDidUpdate(prevProps) {
    // If we've gotten an update to the set of scopes, and it does
    // not correspond to what's in the textarea right now, update
    // the textarea, even at the cost of hurting user input
    const notEqual =
      !equal(this.props.scopes, prevProps.scopes) &&
      !equal(this.props.scopes, this.getScopesFromTextarea());

    if (notEqual) {
      this.scopeText.value = this.props.scopes.join('\n');
    }
  }

  onChange = () => {
    const newScopes = this.getScopesFromTextarea();

    if (!equal(this.props.scopes, newScopes)) {
      this.props.scopesUpdated(newScopes);
    }
  };

  getScopesFromTextarea = () => {
    const textarea = this.scopeText;

    if (!textarea) {
      return this.props.scopes;
    }

    const scopes = textarea.value
      .split(/[\r\n]+/)
      .map(s => s.trim())
      .filter(s => s !== '');

    return Array.from(new Set(scopes)).sort();
  };

  /** Render scopes and associated editor */
  renderScopeEditor() {
    const scopes = clone(this.props.scopes || []).sort();

    return (
      <div>
        <textarea
          className="form-control"
          placeholder="new-scope:for-something:*"
          rows={scopes.length + 1}
          defaultValue={scopes.join('\n')}
          onChange={this.onChange}
          ref={ref => (this.scopeText = ref)}
        />
      </div>
    );
  }

  /** Render a list of scopes */
  renderScopes() {
    const scopes = clone(this.props.scopes || []).sort();

    return (
      <ul className="form-control-static" style={{ paddingLeft: 20 }}>
        {scopes.map(scope => (
          <li key={`scope-editor-${scope}`}>
            <Link to={`/auth/scopes/${encodeURIComponent(scope)}`}>
              <code>{scope}</code>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  render() {
    return this.props.editing ? this.renderScopeEditor() : this.renderScopes();
  }
}
