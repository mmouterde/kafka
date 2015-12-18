"use strict";

var protocol = require('bin-protocol');
var globals  = require('./globals');

// https://cwiki.apache.org/confluence/display/KAFKA/A+Guide+To+The+Kafka+Protocol

/////////////////////////////
// OFFSET COMMIT/FETCH API //
/////////////////////////////

// group coordinator request and response are defined in group_membership.js

// v0
protocol.define('OffsetCommitRequestV0PartitionItem', {
    write: function(data) { // { partition, offset, metadata }
        this
            .Int32BE(data.partition)
            .Int64BE(data.offset)
            .string(data.metadata);
    }
});

protocol.define('OffsetCommitRequestV0TopicItem', {
    write: function(data) { // { topicName, partitions }
        this
            .string(data.topicName)
            .array(data.partitions, this.OffsetCommitRequestV0PartitionItem);
    }
});

protocol.define('OffsetCommitRequestV0', {
    write: function(data) { // { consumerGroupId, topics }
        this
            .RequestHeader({
                apiKey: globals.API_KEYS.OffsetCommitRequest,
                apiVersion: 0,
                correlationId: data.correlationId,
                clientId: data.clientId
            })
            .string(data.consumerGroupId)
            .array(data.topics, this.OffsetCommitRequestV0TopicItem);
    }
});

// v1
protocol.define('OffsetCommitRequestV1PartitionItem', {
    write: function(data) { // { partition, offset, timestamp, metadata }
        this
            .Int32BE(data.partition)
            .Int64BE(data.offset)
            .Int64BE(data.timestamp)
            .string(data.metadata);
    }
});

protocol.define('OffsetCommitRequestV1TopicItem', {
    write: function(data) { // { topicName, partitions }
        this
            .string(data.topicName)
            .array(data.partitions, this.OffsetCommitRequestV1PartitionItem);
    }
});

protocol.define('OffsetCommitRequestV1', {
    write: function(data) { // { consumerGroupId, consumerGroupGenerationId, consumerId,  topics }
        this
            .RequestHeader({
                apiKey: globals.API_KEYS.OffsetCommitRequest,
                apiVersion: 0,
                correlationId: data.correlationId,
                clientId: data.clientId
            })
            .string(data.consumerGroupId)
            .string(data.consumerGroupGenerationId)
            .string(data.consumerId)
            .array(data.topics, this.OffsetCommitRequestV1TopicItem);
    }
});

// v2
protocol.define('OffsetCommitRequestV2', {
    write: function(data) { // { consumerGroupId, consumerGroupGenerationId, consumerId, retentionTime, topics }
        this
            .RequestHeader({
                apiKey: globals.API_KEYS.OffsetCommitRequest,
                apiVersion: 0,
                correlationId: data.correlationId,
                clientId: data.clientId
            })
            .string(data.consumerGroupId)
            .string(data.consumerGroupGenerationId)
            .string(data.consumerId)
            .Int64BE(data.retentionTime)
            .array(data.topics, this.OffsetCommitRequestV0TopicItem); // same as in v0
    }
});


protocol.define('OffsetCommitResponseTopicItem', {
    read: function() {
        this
            .string('topicName')
            .array('partitions', this.OffsetCommitResponsePartitionItem);
    }
});

protocol.define('OffsetCommitResponsePartitionItem', {
    read: function() {
        this
            .Int32BE('partition')
            .ErrorCode('error');
    }
});

// v0, v1 and v2
protocol.define('OffsetCommitResponse', {
    read: function() {
        this
            .Int32BE('correlationId')
            .array('topics', this.OffsetCommitResponseTopicItem);
    }
});


protocol.define('OffsetFetchRequestTopicItem', {
    write: function(data) { // { topicName, partitions }
        this
            .string(data.topicName)
            .array(data.partitions, this.Int32BE);
    }
});

protocol.define('OffsetFetchRequest', {
    write: function(data) { // { consumerGroupId, topics }
        this
            .RequestHeader({
                apiKey: globals.API_KEYS.OffsetFetchRequest,
                apiVersion: 0,
                correlationId: data.correlationId,
                clientId: data.clientId
            })
            .string(data.consumerGroupId)
            .array(data.topics, this.OffsetFetchRequestTopicItem);
    }
});

protocol.define('OffsetFetchResponseTopicItem', {
    read: function() {
        this
            .string('topicName')
            .array('partitions', this.OffsetFetchResponsePartitionItem);
    }
});

protocol.define('OffsetFetchResponsePartitionItem', {
    read: function() {
        this
            .Int32BE('partition')
            .KafkaOffset('offset')
            .string('metadata')
            .ErrorCode('error');
    }
});

protocol.define('OffsetFetchResponse', {
    read: function() {
        this
            .Int32BE('correlationId')
            .array('topics', this.OffsetFetchResponseTopicItem);
    }
});