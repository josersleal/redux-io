import _ from 'lodash';
import { TYPE_KEY, ARRAY_TYPE } from './type';
import { setStatus, STATUS } from '../status';

function objectToArray(object) {
  return object.arr;
}

/**
 * Restore RIO STATUS to transformed subState.
 * @param serializableSubState
 * @param originalSubState
 */
function restoreStatus(serializableSubState, originalSubState) {
  const status = _.isPlainObject(serializableSubState) && serializableSubState[STATUS];
  if (!status) {
    return;
  }

  // eslint-disable-next-line no-param-reassign
  delete originalSubState[STATUS]; // Delete enumerable status
  setStatus(originalSubState, status); // Set non enumerable status
}

/**
 * Creates deep copy of given substate and restores it to original form.
 * @param serializableSubState
 * @returns {*}
 */
function revertTransformedSubstate(serializableSubState) {
  if (
    _.isPlainObject(serializableSubState) &&
    serializableSubState[TYPE_KEY] === ARRAY_TYPE
  ) {
    // Transform "array object" back to array as it was before serialization
    return objectToArray(serializableSubState);
  }

  return serializableSubState;
}

/**
 * Revert transformed (serializable) state.
 * Main function is to transform "array objects" to arrays and restore status as it was.
 * @param serializableState
 * @returns {object} Original state
 */
export function fromSerializableFormat(serializableState) {
  if (!_.isObjectLike(serializableState)) {
    return serializableState;
  }

  const revertedState = revertTransformedSubstate(serializableState);
  const accumulator = _.isArray(revertedState) ? [] : {};
  restoreStatus(serializableState, accumulator);

  return _.reduce(revertedState, (originalState, serializableSubState, subStateKey) => {
    const originalSubState = fromSerializableFormat(serializableSubState);

    // eslint-disable-next-line no-param-reassign
    originalState[subStateKey] = originalSubState;
    return originalState;
  }, accumulator);
}
