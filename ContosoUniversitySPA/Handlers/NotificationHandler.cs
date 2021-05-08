using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ContosoUniversitySPA.Handlers
{
    public static class NotificationHandler
    {
        public static async Task SendCourseCreatedNotification(GraphServiceClient graphServiceClient, int courseId, string courseTitle, string baseUrl, IConfiguration config)
        {
            var appId = "71b0a04a-36cc-479c-b82b-31e260e94a61";
            var tabName = "contosoUniversity";

            var teamId = config.GetSection("ActivityNotification").GetValue<string>("TeamId");
            var channelId = config.GetSection("ActivityNotification").GetValue<string>("ChannelId");
            var userId = config.GetSection("ActivityNotification").GetValue<string>("UserId");

            if (!string.IsNullOrWhiteSpace(appId)
                && !string.IsNullOrWhiteSpace(tabName)
                && !string.IsNullOrWhiteSpace(channelId)
                && !string.IsNullOrWhiteSpace(channelId)
                && !string.IsNullOrWhiteSpace(userId))
            {
                var path = $"/courses/details/{courseId}";
                var websiteUrl = $"{baseUrl}{path}";
                var directLink = $"https://teams.microsoft.com/l/entity/{appId}/{tabName}?webUrl={websiteUrl}&label=Course: {courseTitle}&context={{\"subEntityId\": \"{path}\",\"channelId\": \"{channelId}\"}}";

                await graphServiceClient.Teams[teamId].SendActivityNotification(
                    new TeamworkActivityTopic()
                    {
                        Source = TeamworkActivityTopicSource.Text,
                        WebUrl = directLink,
                        Value = "Contoso University > Courses"
                    },
                    "courseCreated",
                    null,
                    new ItemBody()
                    {
                        Content = "A new Course has been added"
                    },
                    new List<Microsoft.Graph.KeyValuePair>()
                    {
                        new Microsoft.Graph.KeyValuePair()
                        {
                            Name = "courseName",
                            Value = courseTitle
                        }
                    },
                    new AadUserNotificationRecipient()
                    {
                        ODataType = "microsoft.graph.aadUserNotificationRecipient",
                        UserId = userId
                    }
                ).Request().PostAsync();
            }
        }
    }
}
